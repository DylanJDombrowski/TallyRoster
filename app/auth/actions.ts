// app/auth/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { headers, cookies } from "next/headers";
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
      // Supabase will send a confirmation email to the user.
      // The user must click the link in the email to be able to log in.
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Signup Error:", error.message);
    // You can check for specific errors, e.g., if a user already exists.
    if (error.message.includes("User already registered")) {
      return { message: "A user with this email already exists." };
    }
    return { message: "Could not authenticate user. Please try again." };
  }

  // A confirmation link has been sent to the user's email.
  // You might want to show a message on the UI prompting them to check their email.
  return { message: "Check your email to continue signing up." };
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
    return { message: "Could not authenticate user." };
  }

  // A successful login will trigger the middleware to allow access
  // to the dashboard, so we can redirect them.
  redirect("/dashboard");
}
