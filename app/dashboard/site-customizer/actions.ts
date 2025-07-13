// app/dashboard/site-customizer/actions.ts - Enhanced Version
"use server";

import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

const OrgSettingsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3, "Organization name must be at least 3 characters."),
  logo_url: z.string().url("Invalid logo URL.").nullable().or(z.literal("")),
  primary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Primary color must be a valid hex color.")
    .default("#161659"),
  secondary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Secondary color must be a valid hex color.")
    .default("#BD1515"),
  subdomain: z.string().nullable(),
});

// Helper function to get user's organization ID with enhanced security
async function getUserOrganizationId() {
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: orgRole, error } = await supabase
    .from("user_organization_roles")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (error || !orgRole) {
    throw new Error("Could not find user's organization");
  }

  // Only admins can update organization settings
  if (orgRole.role !== "admin") {
    throw new Error("Only administrators can update organization settings");
  }

  return orgRole.organization_id;
}

export async function updateOrganizationSettings(
  prevState: {
    success: boolean;
    message: string;
    errors?: Record<string, string[]> | undefined;
  },
  formData: FormData
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    // Get and validate the organization ID
    const organizationId = await getUserOrganizationId();

    const rawData = {
      id: formData.get("id"),
      name: formData.get("name"),
      logo_url: formData.get("logo_url") || null,
      primary_color: formData.get("primary_color"),
      secondary_color: formData.get("secondary_color"),
      subdomain: formData.get("subdomain"),
    };

    console.log("Raw form data:", rawData);

    const validation = OrgSettingsSchema.safeParse(rawData);

    if (!validation.success) {
      console.error("Validation errors:", validation.error.flatten());
      return {
        success: false,
        message: "Invalid data provided.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const { id, subdomain, logo_url, ...updateData } = validation.data;

    // Ensure the user can only update their own organization
    if (id !== organizationId) {
      return {
        success: false,
        message: "You can only update your own organization.",
      };
    }

    // Clean up logo_url - convert empty string to null
    const cleanedUpdateData = {
      ...updateData,
      logo_url: logo_url === "" ? null : logo_url,
    };

    console.log("Updating organization with data:", cleanedUpdateData);

    const { error } = await supabase.from("organizations").update(cleanedUpdateData).eq("id", id);

    if (error) {
      console.error("Database update error:", error);
      throw error;
    }

    console.log("Organization updated successfully");

    // Revalidate the public-facing site to show changes immediately
    if (subdomain) {
      console.log(`Revalidating paths for subdomain: ${subdomain}`);
      revalidatePath(`/sites/${subdomain}`);
      revalidatePath(`/sites/${subdomain}/`);
      // Also revalidate the forms and links page which uses organization data
      revalidatePath(`/sites/${subdomain}/forms-and-links`);
    }

    // Revalidate the dashboard page
    revalidatePath(`/dashboard/site-customizer`);
    revalidatePath(`/dashboard`);

    return {
      success: true,
      message: "Settings updated successfully! Changes are now live on your website.",
    };
  } catch (error: unknown) {
    console.error("updateOrganizationSettings error:", error);

    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: `Error: ${errorMessage}`,
    };
  }
}

// Additional helper function to preview changes
export async function previewOrganizationChanges(formData: FormData) {
  try {
    // Verify user has permission to preview changes
    await getUserOrganizationId();

    const changes = {
      name: formData.get("name"),
      logo_url: formData.get("logo_url"),
      primary_color: formData.get("primary_color"),
      secondary_color: formData.get("secondary_color"),
    };

    return {
      success: true,
      preview: changes,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Preview failed",
    };
  }
}
