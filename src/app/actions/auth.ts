"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { signIn } from "@/auth";
import { loginSchema, signupSchema } from "@/lib/validation";

export type AuthFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export async function signup(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validatedFields = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, password } = validatedFields.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { message: "An account with this email already exists." };
  }

  const passwordHash = await hash(password, 10);

  await db.insert(users).values({
    name,
    email,
    passwordHash,
    role: "learner",
  });

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  return undefined;
}

export async function login(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      ...validatedFields.data,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Invalid email or password." };
    }
    throw error;
  }

  return undefined;
}

export async function logout() {
  const { signOut } = await import("@/auth");
  await signOut({ redirectTo: "/" });
  redirect("/");
}
