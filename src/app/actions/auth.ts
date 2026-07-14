"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";

export type FormState = {
  error?: string;
  values?: Record<string, string>;
};

function safeNext(raw: FormDataEntryValue | null, fallback: string): string {
  const value = typeof raw === "string" ? raw : "";
  // Only allow internal absolute paths. Reject "//host" and the "/\host"
  // form, which browsers normalize to a protocol-relative external URL.
  if (value.startsWith("/") && !/^\/[/\\]/.test(value)) return value;
  return fallback;
}

function echo(formData: FormData, names: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const n of names) out[n] = String(formData.get(n) ?? "");
  return out;
}

export async function register(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = echo(formData, ["username", "email"]);

  if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) {
    return {
      error:
        "Username must be 3-24 characters (letters, numbers, dot, dash, underscore).",
      values,
    };
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Please enter a valid email address.", values };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", values };
  }

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return {
      error:
        existing.email === email
          ? "An account with this email already exists."
          : "This username is already taken.",
      values,
    };
  }

  let user;
  try {
    user = await db.user.create({
      data: {
        username,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: "CUSTOMER",
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        error: "An account with this email or username already exists.",
        values,
      };
    }
    throw e;
  }

  await createSession(user);
  redirect(safeNext(formData.get("next"), "/account"));
}

export async function login(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const values = echo(formData, ["identifier"]);

  if (!identifier || !password) {
    return { error: "Please fill in all fields.", values };
  }

  const user = await db.user.findFirst({
    where: {
      OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
    },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Wrong username/email or password.", values };
  }

  await createSession(user);
  redirect(
    safeNext(formData.get("next"), user.role === "ADMIN" ? "/admin" : "/account")
  );
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}
