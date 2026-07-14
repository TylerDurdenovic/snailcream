import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";

const COOKIE_NAME = "sc_session";
const SESSION_DAYS = 7;

export type Session = {
  uid: string;
  username: string;
  role: "CUSTOMER" | "ADMIN";
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short. Set it in .env");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(user: {
  id: string;
  username: string;
  role: string;
}): Promise<void> {
  const token = await new SignJWT({
    uid: user.id,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.uid !== "string" || typeof payload.username !== "string")
      return null;
    return {
      uid: payload.uid,
      username: payload.username,
      role: payload.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
    };
  } catch {
    return null;
  }
}

/** Session + fresh role check against the database (use for privileged reads/writes). */
export async function getVerifiedUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.uid } });
  return user;
}

export async function requireUser(nextPath: string) {
  const user = await getVerifiedUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function requireAdmin() {
  const user = await getVerifiedUser();
  if (!user) redirect("/login?next=%2Fadmin");
  if (user.role !== "ADMIN") redirect("/account");
  return user;
}
