"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SponsorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  website_url: z.string().url().nullable().or(z.literal("")),
  logo_url: z.string().url().nullable().or(z.literal("")),
  active: z.boolean(),
  organization_id: z.string().uuid(),
});

export async function createSponsor(formData: FormData) {
  try {
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
      name: formData.get("name"),
      description: formData.get("description") || null,
      website_url: formData.get("website_url") || null,
      logo_url: formData.get("logo_url") || null,
      active: formData.get("active") === "true",
      organization_id: formData.get("organization_id"),
    };

    const validation = SponsorSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.errors[0].message,
      };
    }

    const { data, error } = await supabase
      .from("sponsors")
      .insert(validation.data)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Get organization subdomain for revalidation
    const { data: org } = await supabase
      .from("organizations")
      .select("subdomain")
      .eq("id", validation.data.organization_id)
      .single();

    if (org?.subdomain) {
      revalidatePath(`/sites/${org.subdomain}/sponsors`);
      revalidatePath(`/sites/${org.subdomain}/extended-team`);
    }
    revalidatePath("/dashboard/sponsors");

    return {
      success: true,
      message: "Sponsor added successfully!",
      data,
    };
  } catch (error) {
    console.error("Create sponsor error:", error);
    return {
      success: false,
      message: "Failed to create sponsor",
    };
  }
}

export async function updateSponsor(formData: FormData) {
  try {
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

    const id = formData.get("id") as string;
    const rawData = {
      name: formData.get("name"),
      description: formData.get("description") || null,
      website_url: formData.get("website_url") || null,
      logo_url: formData.get("logo_url") || null,
      active: formData.get("active") === "true",
      organization_id: formData.get("organization_id"),
    };

    const validation = SponsorSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.errors[0].message,
      };
    }

    const { data, error } = await supabase
      .from("sponsors")
      .update(validation.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Get organization subdomain for revalidation
    const { data: org } = await supabase
      .from("organizations")
      .select("subdomain")
      .eq("id", validation.data.organization_id)
      .single();

    if (org?.subdomain) {
      revalidatePath(`/sites/${org.subdomain}/sponsors`);
      revalidatePath(`/sites/${org.subdomain}/extended-team`);
    }
    revalidatePath("/dashboard/sponsors");

    return {
      success: true,
      message: "Sponsor updated successfully!",
      data,
    };
  } catch (error) {
    console.error("Update sponsor error:", error);
    return {
      success: false,
      message: "Failed to update sponsor",
    };
  }
}

export async function deleteSponsor(id: string) {
  try {
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

    // Get sponsor org for revalidation
    const { data: sponsor } = await supabase
      .from("sponsors")
      .select("organization_id")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("sponsors").delete().eq("id", id);

    if (error) {
      throw error;
    }

    if (sponsor) {
      const { data: org } = await supabase
        .from("organizations")
        .select("subdomain")
        .eq("id", sponsor.organization_id)
        .single();

      if (org?.subdomain) {
        revalidatePath(`/sites/${org.subdomain}/sponsors`);
        revalidatePath(`/sites/${org.subdomain}/extended-team`);
      }
    }
    revalidatePath("/dashboard/sponsors");

    return {
      success: true,
      message: "Sponsor deleted successfully!",
    };
  } catch (error) {
    console.error("Delete sponsor error:", error);
    return {
      success: false,
      message: "Failed to delete sponsor",
    };
  }
}

export async function updateSponsorsOrder(sponsorIds: string[]) {
  try {
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

    // Update each sponsor's position
    const updatePromises = sponsorIds.map((id, index) =>
      supabase.from("sponsors").update({ position: index }).eq("id", id)
    );

    const results = await Promise.all(updatePromises);
    const failedUpdates = results.filter((result) => result.error);

    if (failedUpdates.length > 0) {
      throw new Error("Failed to update some sponsor positions");
    }

    revalidatePath("/dashboard/sponsors");

    return {
      success: true,
      message: "Order updated successfully!",
    };
  } catch (error) {
    console.error("Update order error:", error);
    return {
      success: false,
      message: "Failed to update order",
    };
  }
}
