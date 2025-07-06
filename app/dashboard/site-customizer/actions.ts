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

const OrganizationLinkSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .min(1, "Title is required.")
    .max(100, "Title must be 100 characters or less."),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less.")
    .nullable(),
  url: z.string().url("Invalid URL format."),
});

// Helper function to get user's organization ID
async function getUserOrganizationId() {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: orgRole, error } = await supabase
    .from("user_organization_roles")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (error || !orgRole) {
    throw new Error("Could not find user's organization");
  }

  return orgRole.organization_id;
}

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

    const { error } = await supabase.from("organization_links").insert({
      organization_id: organizationId,
      ...validation.data,
    });

    if (error) {
      throw error;
    }

    // Get the organization's subdomain for revalidation
    const { data: org } = await supabase
      .from("organizations")
      .select("subdomain")
      .eq("id", organizationId)
      .single();

    // Revalidate the public-facing site
    if (org?.subdomain) {
      revalidatePath(`/sites/${org.subdomain}`);
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

    const { data, error } = await supabase
      .from("organization_links")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

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

    const { id, ...updateData } = validation.data;

    const { error } = await supabase
      .from("organization_links")
      .update(updateData)
      .eq("id", id!)
      .eq("organization_id", organizationId); // Security: only update links owned by this org

    if (error) {
      throw error;
    }

    // Get the organization's subdomain for revalidation
    const { data: org } = await supabase
      .from("organizations")
      .select("subdomain")
      .eq("id", organizationId)
      .single();

    // Revalidate the public-facing site
    if (org?.subdomain) {
      revalidatePath(`/sites/${org.subdomain}`);
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

    const { error } = await supabase
      .from("organization_links")
      .delete()
      .eq("id", id)
      .eq("organization_id", organizationId); // Security: only delete links owned by this org

    if (error) {
      throw error;
    }

    // Get the organization's subdomain for revalidation
    const { data: org } = await supabase
      .from("organizations")
      .select("subdomain")
      .eq("id", organizationId)
      .single();

    // Revalidate the public-facing site
    if (org?.subdomain) {
      revalidatePath(`/sites/${org.subdomain}`);
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
