"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  content: string;
  image_url: string | null;
  published_date: string;
  team_name: string | null;
  season: string | null;
  location: string | null;
  tournament_name: string | null;
  place: string | null;
  status: string;
  author_id: string | null;
  organization_id: string;
  created_at: string;
  author?: {
    first_name: string | null;
    last_name: string | null;
  };
};

export type CreateBlogPostData = {
  title: string;
  slug: string;
  short_description?: string;
  content: string;
  image_url?: string;
  published_date: string;
  team_name?: string;
  season?: string;
  location?: string;
  tournament_name?: string;
  place?: string;
  status: "draft" | "published";
};

export type UpdateBlogPostData = Partial<CreateBlogPostData>;

// Generate a slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Get current user's organization
async function getCurrentUserOrganization() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: userRole } = await supabase
    .from("user_organization_roles")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!userRole) throw new Error("User not associated with any organization");

  return userRole.organization_id;
}

// Create a new blog post
export async function createBlogPost(data: CreateBlogPostData) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const organizationId = await getCurrentUserOrganization();

    // Ensure slug is unique within the organization
    let slug = data.slug || generateSlug(data.title);
    let counter = 1;
    const originalSlug = slug;

    while (true) {
      const { data: existing } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("slug", slug)
        .single();

      if (!existing) break;

      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    const { data: blogPost, error } = await supabase
      .from("blog_posts")
      .insert({
        ...data,
        slug,
        author_id: user.id,
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/blog");
    return { success: true, data: blogPost };
  } catch (error) {
    console.error("Error creating blog post:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create blog post",
    };
  }
}

// Update a blog post
export async function updateBlogPost(id: string, data: UpdateBlogPostData) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const organizationId = await getCurrentUserOrganization();

    // If slug is being updated, ensure it's unique
    if (data.slug) {
      let slug = data.slug;
      let counter = 1;
      const originalSlug = slug;

      while (true) {
        const { data: existing } = await supabase
          .from("blog_posts")
          .select("id")
          .eq("organization_id", organizationId)
          .eq("slug", slug)
          .neq("id", id)
          .single();

        if (!existing) break;

        slug = `${originalSlug}-${counter}`;
        counter++;
      }
      data.slug = slug;
    }

    const { data: blogPost, error } = await supabase
      .from("blog_posts")
      .update(data)
      .eq("id", id)
      .eq("organization_id", organizationId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/blog");
    revalidatePath(`/dashboard/blog/${id}`);
    return { success: true, data: blogPost };
  } catch (error) {
    console.error("Error updating blog post:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update blog post",
    };
  }
}

// Delete a blog post
export async function deleteBlogPost(id: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const organizationId = await getCurrentUserOrganization();

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id)
      .eq("organization_id", organizationId);

    if (error) throw error;

    revalidatePath("/dashboard/blog");
    return { success: true };
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete blog post",
    };
  }
}

// Get all blog posts for the current organization
export async function getBlogPosts(status?: "draft" | "published") {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const organizationId = await getCurrentUserOrganization();

    let query = supabase
      .from("blog_posts")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get author details separately for now
    const postsWithAuthors = await Promise.all(
      (data || []).map(async (post) => {
        if (post.author_id) {
          const { data: authorProfile } = await supabase
            .from("user_profiles")
            .select("first_name, last_name")
            .eq("user_id", post.author_id)
            .single();

          return { ...post, author: authorProfile };
        }
        return { ...post, author: null };
      })
    );

    return { success: true, data: postsWithAuthors as BlogPost[] };
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch blog posts",
    };
  }
}

// Get a single blog post by ID
export async function getBlogPost(id: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const organizationId = await getCurrentUserOrganization();

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .eq("organization_id", organizationId)
      .single();

    if (error) throw error;

    // Get author details separately
    let author = null;
    if (data.author_id) {
      const { data: authorProfile } = await supabase
        .from("user_profiles")
        .select("first_name, last_name")
        .eq("user_id", data.author_id)
        .single();
      author = authorProfile;
    }

    return { success: true, data: { ...data, author } as BlogPost };
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch blog post",
    };
  }
}

// Get published blog posts for public site (by subdomain)
export async function getPublishedBlogPosts(subdomain: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // First get the organization
    const { data: organization } = await supabase
      .from("organizations")
      .select("id")
      .eq("subdomain", subdomain)
      .single();

    if (!organization) throw new Error("Organization not found");

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("organization_id", organization.id)
      .eq("status", "published")
      .order("published_date", { ascending: false });

    if (error) throw error;

    // Get author details for each post
    const postsWithAuthors = await Promise.all(
      (data || []).map(async (post) => {
        let author = null;
        if (post.author_id) {
          const { data: authorProfile } = await supabase
            .from("user_profiles")
            .select("first_name, last_name")
            .eq("user_id", post.author_id)
            .single();
          author = authorProfile;
        }
        return { ...post, author };
      })
    );

    return { success: true, data: postsWithAuthors as BlogPost[] };
  } catch (error) {
    console.error("Error fetching published blog posts:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch blog posts",
    };
  }
}

// Get a published blog post by slug for public site
export async function getPublishedBlogPostBySlug(
  subdomain: string,
  slug: string
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // First get the organization
    const { data: organization } = await supabase
      .from("organizations")
      .select("id")
      .eq("subdomain", subdomain)
      .single();

    if (!organization) throw new Error("Organization not found");

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("organization_id", organization.id)
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) throw error;

    // Get author details
    let author = null;
    if (data.author_id) {
      const { data: authorProfile } = await supabase
        .from("user_profiles")
        .select("first_name, last_name")
        .eq("user_id", data.author_id)
        .single();
      author = authorProfile;
    }

    return { success: true, data: { ...data, author } as BlogPost };
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch blog post",
    };
  }
}
