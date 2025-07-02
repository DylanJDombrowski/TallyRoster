// app/dashboard/site-customizer/actions.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

const OrgSettingsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3, "Organization name must be at least 3 characters."),
  logo_url: z.string().url("Invalid logo URL.").nullable(),
  primary_color: z
    .string()
    .startsWith("#", "Color must be a hex value.")
    .length(7),
  secondary_color: z
    .string()
    .startsWith("#", "Color must be a hex value.")
    .length(7),
  subdomain: z.string().nullable(), // Subdomain can be null
});

// The server action must accept the previous state as its first argument
export async function updateOrganizationSettings(
  prevState: {
    success: boolean;
    message: string;
    errors?: Record<string, string[]> | undefined;
  },
  formData: FormData
) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const rawData = {
    id: formData.get("id"),
    name: formData.get("name"),
    logo_url: formData.get("logo_url") || null,
    primary_color: formData.get("primary_color"),
    secondary_color: formData.get("secondary_color"),
    subdomain: formData.get("subdomain"),
  };

  const validation = OrgSettingsSchema.safeParse(rawData);

  if (!validation.success) {
    console.error(validation.error.flatten());
    return {
      success: false,
      message: "Invalid data provided.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { id, subdomain, ...updateData } = validation.data;

  try {
    const { error } = await supabase
      .from("organizations")
      .update(updateData)
      .eq("id", id);

    if (error) {
      throw error;
    }

    // Revalidate the public-facing site to show changes immediately
    if (subdomain) {
      revalidatePath(`/sites/${subdomain}`);
    }
    revalidatePath(`/`);

    return {
      success: true,
      message: "Settings updated successfully!",
    };
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      message: `Database Error: ${errorMessage}`,
    };
  }
}
