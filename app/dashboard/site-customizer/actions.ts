// app/dashboard/site-customizer/actions.ts - FIXED VERSION
"use server";

import { createServerClient } from "@supabase/ssr";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

const OrgSettingsSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(3, "Organization name must be at least 3 characters."),
  slogan: z.string().max(100, "Slogan must be 100 characters or less.").optional().nullable(),
  logo_url: z.string().url("Invalid logo URL.").nullable().or(z.literal("")),
  primary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Primary color must be a valid hex color.")
    .default("#161659"),
  secondary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Secondary color must be a valid hex color.")
    .default("#BD1515"),
  theme: z.enum(["light", "dark"]).default("light"),
  subdomain: z.string().nullable(),
});

// Helper function to get user's organization ID with enhanced security
async function getUserOrganizationId() {
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get: (name: string) => cookieStore.get(name)?.value },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data: orgRole, error } = await supabase
    .from("user_organization_roles")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (error || !orgRole) throw new Error("Could not find user's organization");
  if (orgRole.role !== "admin") throw new Error("Only administrators can update organization settings");

  return orgRole.organization_id;
}

export async function updateOrganizationSettings(prevState: unknown, formData: FormData) {
  try {
    const authenticatedOrgId = await getUserOrganizationId();

    const rawData = {
      organizationId: formData.get("organizationId"),
      name: formData.get("name"),
      slogan: formData.get("slogan"),
      logo_url: formData.get("logo_url"),
      primary_color: formData.get("primary_color"),
      secondary_color: formData.get("secondary_color"),
      theme: formData.get("theme"),
      subdomain: formData.get("subdomain"),
    };

    const validation = OrgSettingsSchema.safeParse(rawData);

    if (!validation.success) {
      console.error("Validation errors:", validation.error.flatten());
      return {
        success: false,
        message: "Invalid data provided.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    if (validation.data.organizationId !== authenticatedOrgId) {
      return {
        success: false,
        message: "Authorization Error: You can only update your own organization.",
      };
    }

    const { organizationId, subdomain, ...updateData } = validation.data;

    const cleanedUpdateData = {
      ...updateData,
      logo_url: updateData.logo_url === "" ? null : updateData.logo_url,
    };

    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: { get: (name: string) => cookieStore.get(name)?.value },
    });

    const { error } = await supabase.from("organizations").update(cleanedUpdateData).eq("id", organizationId);

    if (error) {
      throw error;
    }

    // CRITICAL: Revalidate both the dashboard AND the subdomain site
    if (subdomain) {
      console.log(`Revalidating theme for subdomain: ${subdomain}`);

      // Revalidate the entire subdomain site layout and pages
      revalidatePath(`/sites/${subdomain}`, "layout");
      revalidatePath(`/sites/${subdomain}`, "page");
      revalidatePath(`/sites/${subdomain}/teams`, "page");
      revalidatePath(`/sites/${subdomain}/forms-and-links`, "page");

      // Use tags for more efficient cache invalidation
      revalidateTag(`org-${organizationId}`);
      revalidateTag(`subdomain-${subdomain}`);
    }

    // Revalidate dashboard
    revalidatePath(`/dashboard/site-customizer`);

    return {
      success: true,
      message: "Settings updated successfully! Changes will appear on your live site within moments.",
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Theme update error:", errorMessage);
    return { success: false, message: `Error: ${errorMessage}` };
  }
}
