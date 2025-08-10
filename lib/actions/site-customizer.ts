// lib/actions/site-customizer.ts - UPDATED WITH PAGE VISIBILITY
"use server";

import { createServerClient } from "@supabase/ssr";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

const OrgSettingsSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(3, "Organization name must be at least 3 characters."),
  font_family: z.string().default("Inter"),
  theme_name: z.string().default("default"),
  slogan: z
    .string()
    .max(100, "Slogan must be 100 characters or less.")
    .optional()
    .nullable(),
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
  // Page visibility fields
  show_alumni: z.boolean().default(false),
  show_blog: z.boolean().default(true),
  show_forms_links: z.boolean().default(true),
  show_sponsors: z.boolean().default(false),
  show_social: z.boolean().default(true),
  // Navigation label fields
  alumni_nav_label: z
    .string()
    .max(50, "Navigation label must be 50 characters or less.")
    .default("Alumni"),
  blog_nav_label: z
    .string()
    .max(50, "Navigation label must be 50 characters or less.")
    .default("News"),
  forms_links_nav_label: z
    .string()
    .max(50, "Navigation label must be 50 characters or less.")
    .default("Forms & Links"),
  sponsors_nav_label: z
    .string()
    .max(50, "Navigation label must be 50 characters or less.")
    .default("Sponsors"),
  social_nav_label: z
    .string()
    .max(50, "Navigation label must be 50 characters or less.")
    .default("Social"),
  // Social media URL fields
  facebook_url: z
    .string()
    .url("Invalid Facebook URL.")
    .nullable()
    .or(z.literal("")),
  twitter_url: z
    .string()
    .url("Invalid Twitter URL.")
    .nullable()
    .or(z.literal("")),
  instagram_url: z
    .string()
    .url("Invalid Instagram URL.")
    .nullable()
    .or(z.literal("")),
  youtube_url: z
    .string()
    .url("Invalid YouTube URL.")
    .nullable()
    .or(z.literal("")),
  linkedin_url: z
    .string()
    .url("Invalid LinkedIn URL.")
    .nullable()
    .or(z.literal("")),
  tiktok_url: z
    .string()
    .url("Invalid TikTok URL.")
    .nullable()
    .or(z.literal("")),
  social_embed_code: z
    .string()
    .max(10000, "Embed code must be 10,000 characters or less.")
    .nullable()
    .or(z.literal("")),
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

// Helper function to get user's organization ID with enhanced security
async function getUserOrganizationId() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get: (name: string) => cookieStore.get(name)?.value },
    }
  );

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
  if (orgRole.role !== "admin")
    throw new Error("Only administrators can update organization settings");

  return orgRole.organization_id;
}

export async function updateOrganizationSettings(
  prevState: unknown,
  formData: FormData
) {
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
      // Page visibility data
      show_alumni: formData.get("show_alumni") === "on",
      show_blog: formData.get("show_blog") === "on",
      show_forms_links: formData.get("show_forms_links") === "on",
      show_sponsors: formData.get("show_sponsors") === "on",
      show_social: formData.get("show_social") === "on",
      // Navigation label data
      alumni_nav_label: formData.get("alumni_nav_label") || "Alumni",
      blog_nav_label: formData.get("blog_nav_label") || "News",
      forms_links_nav_label:
        formData.get("forms_links_nav_label") || "Forms & Links",
      sponsors_nav_label: formData.get("sponsors_nav_label") || "Sponsors",
      social_nav_label: formData.get("social_nav_label") || "Social",
      // Social media URL data
      facebook_url: formData.get("facebook_url"),
      twitter_url: formData.get("twitter_url"),
      instagram_url: formData.get("instagram_url"),
      youtube_url: formData.get("youtube_url"),
      linkedin_url: formData.get("linkedin_url"),
      tiktok_url: formData.get("tiktok_url"),
      social_embed_code: formData.get("social_embed_code"),
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
        message:
          "Authorization Error: You can only update your own organization.",
      };
    }

    const { organizationId, subdomain, ...updateData } = validation.data;

    const cleanedUpdateData = {
      ...updateData,
      font_family: updateData.font_family || "Inter",
      theme_name: updateData.theme_name || "default",
      logo_url: updateData.logo_url === "" ? null : updateData.logo_url,
      facebook_url:
        updateData.facebook_url === "" ? null : updateData.facebook_url,
      twitter_url:
        updateData.twitter_url === "" ? null : updateData.twitter_url,
      instagram_url:
        updateData.instagram_url === "" ? null : updateData.instagram_url,
      youtube_url:
        updateData.youtube_url === "" ? null : updateData.youtube_url,
      linkedin_url:
        updateData.linkedin_url === "" ? null : updateData.linkedin_url,
      tiktok_url: updateData.tiktok_url === "" ? null : updateData.tiktok_url,
      social_embed_code:
        updateData.social_embed_code === ""
          ? null
          : updateData.social_embed_code,
    };

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: { get: (name: string) => cookieStore.get(name)?.value },
      }
    );

    const { error } = await supabase
      .from("organizations")
      .update(cleanedUpdateData)
      .eq("id", organizationId);

    if (error) {
      throw error;
    }

    // CRITICAL: Revalidate both the dashboard AND the subdomain site
    if (subdomain) {
      console.log(
        `Revalidating theme and navigation for subdomain: ${subdomain}`
      );

      // Revalidate the entire subdomain site layout and pages
      revalidatePath(`/sites/${subdomain}`, "layout");
      revalidatePath(`/sites/${subdomain}`, "page");
      revalidatePath(`/sites/${subdomain}/teams`, "page");
      revalidatePath(`/sites/${subdomain}/forms-and-links`, "page");
      revalidatePath(`/sites/${subdomain}/alumni`, "page");
      revalidatePath(`/sites/${subdomain}/sponsors`, "page");
      revalidatePath(`/sites/${subdomain}/social`, "page"); // Updated route
      revalidatePath(`/sites/${subdomain}/blog`, "page");

      // Use tags for more efficient cache invalidation
      revalidateTag(`org-${organizationId}`);
      revalidateTag(`subdomain-${subdomain}`);
    }

    // Revalidate dashboard
    revalidatePath(`/dashboard/site-customizer`);

    return {
      success: true,
      message:
        "Settings updated successfully! Changes will appear on your live site within moments.",
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Settings update error:", errorMessage);
    return { success: false, message: `Error: ${errorMessage}` };
  }
}

// ============================================================================
// ORGANIZATION LINKS ACTIONS (unchanged)
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
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

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
      .eq("organization_id", organizationId);

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
      .eq("organization_id", organizationId);

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
      throw new Error(
        "Some links don't exist or don't belong to your organization"
      );
    }

    // Update each link with its new position
    const updatePromises = linkIds.map((linkId, index) =>
      supabase
        .from("organization_links")
        .update({ position: index })
        .eq("id", linkId)
        .eq("organization_id", organizationId)
    );

    const results = await Promise.all(updatePromises);

    // Check if any updates failed
    const failedUpdates = results.filter((result) => result.error);
    if (failedUpdates.length > 0) {
      console.error("Some link order updates failed:", failedUpdates);
      throw new Error("Failed to update some link positions");
    }

    // Get the organization's subdomain for revalidation
    const { data: org } = await supabase
      .from("organizations")
      .select("subdomain")
      .eq("id", organizationId)
      .single();

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
