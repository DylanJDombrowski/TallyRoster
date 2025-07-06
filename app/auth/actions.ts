// app/auth/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

// Zod schema for validation
const SignupSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

export async function signup(prevState: unknown, formData: FormData) {
  const headersList = await headers();
  const origin = headersList.get("origin");

  const validation = SignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      message: "Invalid data provided.",
    };
  }

  const { email, password } = validation.data;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Use environment variable or fallback to current origin
      emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` : `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Signup Error:", error.message);

    // Handle common Supabase errors
    if (error.message.includes("User already registered")) {
      return { message: "A user with this email already exists." };
    }
    if (error.message.includes("Password should be")) {
      return { message: "Password must be at least 8 characters long." };
    }
    if (error.message.includes("Invalid email")) {
      return { message: "Please enter a valid email address." };
    }

    return { message: "Could not create account. Please try again." };
  }

  // Success message for email confirmation
  return {
    message: "Check your email to confirm your account and complete signup.",
    success: true,
  };
}

export async function login(prevState: unknown, formData: FormData) {
  const validation = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      message: "Invalid data provided.",
    };
  }

  const { email, password } = validation.data;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login Error:", error.message);

    // Handle common login errors
    if (error.message.includes("Invalid login credentials")) {
      return { message: "Invalid email or password." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { message: "Please check your email and confirm your account before signing in." };
    }

    return { message: "Could not sign in. Please try again." };
  }

  // Successful login - redirect to dashboard
  redirect("/dashboard");
}
