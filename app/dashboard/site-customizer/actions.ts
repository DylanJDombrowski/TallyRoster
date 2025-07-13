// app/dashboard/site-customizer/actions.ts - Complete Enhanced Version
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

const OrganizationLinkSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required.").max(100, "Title must be 100 characters or less."),
  description: z.string().max(500, "Description must be 500 characters or less.").nullable(),
  url: z.string().url("Invalid URL format."),
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

// ============================================================================
// ORGANIZATION LINKS ACTIONS
// ============================================================================

export async function createOrganizationLink(
  prevState: {
    success: boolean;
    message: string;
    errors?: Record<string, string[]> | undefined;
  },
  formData: FormData
) {
  try {
    const organizationId = await getUserOrganizationId();

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description") || null,
      url: formData.get("url"),
    };

    const validation = OrganizationLinkSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        message: "Invalid data provided.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    const { error } = await supabase.from("organization_links").insert({
      organization_id: organizationId,
      ...validation.data,
    });

    if (error) {
      throw error;
    }

    // Get the organization's subdomain for revalidation
    const { data: org } = await supabase.from("organizations").select("subdomain").eq("id", organizationId).single();

    // Revalidate the public-facing site
    if (org?.subdomain) {
      revalidatePath(`/sites/${org.subdomain}`);
      revalidatePath(`/sites/${org.subdomain}/forms-and-links`);
    }
    revalidatePath("/dashboard/site-customizer");

    return {
      success: true,
      message: "Link created successfully!",
    };
  } catch (error: unknown) {
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

export async function getOrganizationLinks() {
  try {
    const organizationId = await getUserOrganizationId();

    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    const { data, error } = await supabase
      .from("organization_links")
      .select("*")
      .eq("organization_id", organizationId)
      .order("position", { ascending: true }) // Order by position first
      .order("created_at", { ascending: true }); // Then by creation date as fallback

    if (error) {
      throw error;
    }

    return { success: true, data: data || [] };
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      message: `Error fetching links: ${errorMessage}`,
      data: [],
    };
  }
}

export async function updateOrganizationLink(
  prevState: {
    success: boolean;
    message: string;
    errors?: Record<string, string[]> | undefined;
  },
  formData: FormData
) {
  try {
    const organizationId = await getUserOrganizationId();

    const rawData = {
      id: formData.get("id"),
      title: formData.get("title"),
      description: formData.get("description") || null,
      url: formData.get("url"),
    };

    const validation = OrganizationLinkSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        message: "Invalid data provided.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    const { id, ...updateData } = validation.data;

    const { error } = await supabase.from("organization_links").update(updateData).eq("id", id!).eq("organization_id", organizationId); // Security: only update links owned by this org

    if (error) {
      throw error;
    }

    // Get the organization's subdomain for revalidation
    const { data: org } = await supabase.from("organizations").select("subdomain").eq("id", organizationId).single();

    // Revalidate the public-facing site
    if (org?.subdomain) {
      revalidatePath(`/sites/${org.subdomain}`);
      revalidatePath(`/sites/${org.subdomain}/forms-and-links`);
    }
    revalidatePath("/dashboard/site-customizer");

    return {
      success: true,
      message: "Link updated successfully!",
    };
  } catch (error: unknown) {
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

export async function deleteOrganizationLink(id: string) {
  try {
    const organizationId = await getUserOrganizationId();

    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    const { error } = await supabase.from("organization_links").delete().eq("id", id).eq("organization_id", organizationId); // Security: only delete links owned by this org

    if (error) {
      throw error;
    }

    // Get the organization's subdomain for revalidation
    const { data: org } = await supabase.from("organizations").select("subdomain").eq("id", organizationId).single();

    // Revalidate the public-facing site
    if (org?.subdomain) {
      revalidatePath(`/sites/${org.subdomain}`);
      revalidatePath(`/sites/${org.subdomain}/forms-and-links`);
    }
    revalidatePath("/dashboard/site-customizer");

    return {
      success: true,
      message: "Link deleted successfully!",
    };
  } catch (error: unknown) {
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

export async function updateLinksOrder(linkIds: string[]) {
  try {
    const organizationId = await getUserOrganizationId();

    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    // Verify all links belong to this organization before updating
    const { data: existingLinks, error: verifyError } = await supabase
      .from("organization_links")
      .select("id")
      .eq("organization_id", organizationId)
      .in("id", linkIds);

    if (verifyError) {
      throw verifyError;
    }

    // Check that all provided link IDs exist and belong to this org
    if (!existingLinks || existingLinks.length !== linkIds.length) {
      throw new Error("Some links don't exist or don't belong to your organization");
    }

    // Update each link with its new position
    // We use a Promise.all to update all records efficiently
    const updatePromises = linkIds.map(
      (linkId, index) =>
        supabase.from("organization_links").update({ position: index }).eq("id", linkId).eq("organization_id", organizationId) // Double security check
    );

    const results = await Promise.all(updatePromises);

    // Check if any updates failed
    const failedUpdates = results.filter((result) => result.error);
    if (failedUpdates.length > 0) {
      console.error("Some link order updates failed:", failedUpdates);
      throw new Error("Failed to update some link positions");
    }

    // Get the organization's subdomain for revalidation
    const { data: org } = await supabase.from("organizations").select("subdomain").eq("id", organizationId).single();

    // Revalidate both the dashboard and public pages
    revalidatePath("/dashboard/site-customizer");
    if (org?.subdomain) {
      revalidatePath(`/sites/${org.subdomain}/forms-and-links`);
    }

    return {
      success: true,
      message: "Link order updated successfully!",
    };
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      message: `Error updating link order: ${errorMessage}`,
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
