export const PRODUCT = {
  name: "Snail Cream Set — 5 x 10g",
  unitPriceCents: 1500,
  currency: "EUR",
  boxes: 5,
  gramsPerBox: 10,
} as const;

export const PAYMENT_METHODS = [
  { value: "GIFT_CARD", label: "Gift card (online)" },
  { value: "BANK_TRANSFER", label: "Bank transfer (SEPA)" },
  { value: "PAYPAL", label: "PayPal" },
] as const;

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

// Statuses that mean the customer's payment has actually been received.
// A payment confirmation only asserts "paid" for orders in one of these.
const PAID_STATUSES = new Set(["PAID", "SHIPPED", "DELIVERED"]);

export function isPaid(status: string): boolean {
  return PAID_STATUSES.has(status);
}

export function paymentLabel(value: string): string {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

export function formatMoney(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(
    cents / 100
  );
}

export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Format a Date as a value for <input type="datetime-local" step="1"> in
 *  server-local time. Includes seconds so admin saves don't truncate them. */
export function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  PAID: "bg-sky-100 text-sky-800 border-sky-200",
  SHIPPED: "bg-violet-100 text-violet-800 border-violet-200",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
};
