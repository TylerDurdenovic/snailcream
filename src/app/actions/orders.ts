"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getVerifiedUser, requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES, PAYMENT_METHODS, PRODUCT } from "@/lib/shop";

export type FormState = {
  error?: string;
  success?: string;
  values?: Record<string, string>;
};

const PAYMENT_VALUES = PAYMENT_METHODS.map((m) => m.value) as string[];

const MAX_QUANTITY = 10_000;
const MAX_AMOUNT_CENTS = 500_000_000; // €5,000,000 — safely below Int32 max

const ORDER_FIELDS = [
  "customer",
  "invoiceNumber",
  "orderedAt",
  "status",
  "productName",
  "quantity",
  "amountEur",
  "paymentMethod",
  "paymentReference",
  "carrier",
  "trackingNumber",
  "shippingName",
  "shippingAddress",
  "shippingCity",
  "shippingPostal",
  "shippingCountry",
  "notes",
];

function echo(formData: FormData, names: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const n of names) out[n] = String(formData.get(n) ?? "");
  return out;
}

function isUniqueViolation(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
  );
}

async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.order.count();
  for (let i = count + 1; ; i++) {
    const candidate = `SC-${year}-${String(i).padStart(4, "0")}`;
    const clash = await db.order.findUnique({
      where: { invoiceNumber: candidate },
    });
    if (!clash) return candidate;
  }
}

/** Create an order, retrying with a fresh invoice number if a concurrent
 *  checkout grabbed the same one (unique-constraint race). */
async function createOrderWithInvoiceNumber(
  data: Omit<Prisma.OrderUncheckedCreateInput, "invoiceNumber">
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await db.order.create({
        data: { ...data, invoiceNumber: await nextInvoiceNumber() },
      });
    } catch (e) {
      if (isUniqueViolation(e)) continue;
      throw e;
    }
  }
  throw new Error("Could not allocate a unique invoice number.");
}

function parseEuroToCents(raw: string): number | null {
  const normalized = raw.replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(parseFloat(normalized) * 100);
}

export async function placeOrder(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getVerifiedUser();
  if (!user) redirect("/login?next=%2Fcheckout");

  const quantity = parseInt(String(formData.get("quantity") ?? "1"), 10);
  const paymentMethod = String(formData.get("paymentMethod") ?? "");
  const paymentReference =
    String(formData.get("paymentReference") ?? "").trim() || null;
  const shippingName = String(formData.get("shippingName") ?? "").trim();
  const shippingAddress = String(formData.get("shippingAddress") ?? "").trim();
  const shippingCity = String(formData.get("shippingCity") ?? "").trim();
  const shippingPostal = String(formData.get("shippingPostal") ?? "").trim();
  const shippingCountry =
    String(formData.get("shippingCountry") ?? "").trim() || "Germany";
  const values = echo(formData, ORDER_FIELDS);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
    return { error: "Quantity must be between 1 and 50 sets.", values };
  }
  if (!PAYMENT_VALUES.includes(paymentMethod)) {
    return { error: "Please choose a payment method.", values };
  }
  if (!shippingName || !shippingAddress || !shippingCity || !shippingPostal) {
    return { error: "Please fill in your full shipping address.", values };
  }

  const order = await createOrderWithInvoiceNumber({
    userId: user.id,
    productName: PRODUCT.name,
    unitPriceCents: PRODUCT.unitPriceCents,
    quantity,
    amountCents: PRODUCT.unitPriceCents * quantity,
    currency: PRODUCT.currency,
    paymentMethod,
    paymentReference,
    status: "PENDING",
    shippingName,
    shippingAddress,
    shippingCity,
    shippingPostal,
    shippingCountry,
  });

  redirect(`/account/invoices/${order.id}?placed=1`);
}

type ParsedOrder = {
  invoiceNumber: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  amountCents: number;
  paymentMethod: string;
  paymentReference: string | null;
  status: string;
  trackingNumber: string | null;
  carrier: string | null;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostal: string;
  shippingCountry: string;
  notes: string | null;
  orderedAt: Date;
};

function parseOrderForm(formData: FormData): {
  error?: string;
  data?: ParsedOrder;
} {
  const quantity = parseInt(String(formData.get("quantity") ?? "1"), 10);
  const amountRaw = String(formData.get("amountEur") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "");
  const status = String(formData.get("status") ?? "");
  const orderedAtRaw = String(formData.get("orderedAt") ?? "").trim();
  const invoiceNumber = String(formData.get("invoiceNumber") ?? "").trim();

  if (!invoiceNumber) return { error: "Invoice number is required." };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY)
    return { error: `Quantity must be between 1 and ${MAX_QUANTITY}.` };
  const amountCents = parseEuroToCents(amountRaw);
  if (amountCents === null)
    return { error: "Amount must be a number like 15.00 or 15,00." };
  if (amountCents > MAX_AMOUNT_CENTS)
    return { error: "Amount is too large." };
  if (!PAYMENT_VALUES.includes(paymentMethod))
    return { error: "Invalid payment method." };
  if (!(ORDER_STATUSES as readonly string[]).includes(status))
    return { error: "Invalid order status." };
  const orderedAt = new Date(orderedAtRaw);
  if (isNaN(orderedAt.getTime())) return { error: "Invalid order date." };

  return {
    data: {
      invoiceNumber,
      productName:
        String(formData.get("productName") ?? "").trim() || PRODUCT.name,
      quantity,
      // keep the printed invoice's line math consistent with the total
      unitPriceCents: Math.round(amountCents / quantity),
      amountCents,
      paymentMethod,
      paymentReference:
        String(formData.get("paymentReference") ?? "").trim() || null,
      status,
      trackingNumber:
        String(formData.get("trackingNumber") ?? "").trim() || null,
      carrier: String(formData.get("carrier") ?? "").trim() || null,
      shippingName: String(formData.get("shippingName") ?? "").trim(),
      shippingAddress: String(formData.get("shippingAddress") ?? "").trim(),
      shippingCity: String(formData.get("shippingCity") ?? "").trim(),
      shippingPostal: String(formData.get("shippingPostal") ?? "").trim(),
      shippingCountry:
        String(formData.get("shippingCountry") ?? "").trim() || "Germany",
      notes: String(formData.get("notes") ?? "").trim() || null,
      orderedAt,
    },
  };
}

export async function adminUpdateOrder(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const values = echo(formData, ORDER_FIELDS);

  const id = String(formData.get("id") ?? "");
  const order = await db.order.findUnique({ where: { id } });
  if (!order) return { error: "Order not found.", values };

  const parsed = parseOrderForm(formData);
  if (parsed.error || !parsed.data) return { error: parsed.error, values };

  try {
    await db.order.update({ where: { id }, data: parsed.data });
  } catch (e) {
    if (isUniqueViolation(e)) {
      return {
        error: "Another order already uses this invoice number.",
        values,
      };
    }
    throw e;
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/account");
  return { success: "Order updated." };
}

export async function adminCreateOrder(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const values = echo(formData, ORDER_FIELDS);

  const customer = String(formData.get("customer") ?? "").trim();
  const user = await db.user.findFirst({
    where: { OR: [{ email: customer.toLowerCase() }, { username: customer }] },
  });
  if (!user) return { error: `No user found for "${customer}".`, values };

  const parsed = parseOrderForm(formData);
  if (parsed.error || !parsed.data) return { error: parsed.error, values };

  let order;
  try {
    order = await db.order.create({
      data: { ...parsed.data, userId: user.id },
    });
  } catch (e) {
    if (isUniqueViolation(e)) {
      return { error: "This invoice number is already in use.", values };
    }
    throw e;
  }

  revalidatePath("/admin");
  redirect(`/admin/orders/${order.id}?created=1`);
}

export async function adminDeleteOrder(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.order.delete({ where: { id } });
  revalidatePath("/admin");
  redirect("/admin?deleted=1");
}
