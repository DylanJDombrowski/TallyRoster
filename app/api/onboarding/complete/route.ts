// app/api/onboarding/complete/route.ts
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const OnboardingDataSchema = z.object({
  // Organization Setup
  organizationName: z.string().min(3, "Organization name must be at least 3 characters"),
  organizationType: z.string().optional(),
  sport: z.string().optional(),
  subdomain: z.string().min(3, "Subdomain must be at least 3 characters"),
  yourRole: z.string().optional(),

  // Visual Customization
  primaryColor: z.string().default("#161659"),
  secondaryColor: z.string().default("#BD1515"),
  logo: z.any().optional(), // File will be handled separately
  logoPreview: z.string().optional(),

  // Plan Selection
  selectedPlan: z.enum(["starter", "pro", "elite"]),
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = OnboardingDataSchema.parse(body);

    // Check if subdomain is available
    const { data: existingOrg } = await supabase
      .from("organizations")
      .select("id")
      .eq("subdomain", validatedData.subdomain.toLowerCase())
      .single();

    if (existingOrg) {
      return NextResponse.json({ error: "Subdomain is not available" }, { status: 400 });
    }

    // Create the organization
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: validatedData.organizationName,
        organization_type: validatedData.organizationType,
        sport: validatedData.sport,
        subdomain: validatedData.subdomain.toLowerCase(),
        primary_color: validatedData.primaryColor,
        secondary_color: validatedData.secondaryColor,
        logo_url: validatedData.logoPreview,
        owner_id: user.id,
        subscription_plan: "trial", // Start with trial
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      })
      .select()
      .single();

    if (orgError) {
      console.error("Error creating organization:", orgError);
      return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
    }

    // Create user-organization role
    const { error: roleError } = await supabase.from("user_organization_roles").insert({
      user_id: user.id,
      organization_id: organization.id,
      role: "admin",
    });

    if (roleError) {
      console.error("Error creating user role:", roleError);
      return NextResponse.json({ error: "Failed to assign user role" }, { status: 500 });
    }

    // Create Stripe Checkout Session (when Stripe is set up)
    const checkoutUrl = null;
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        // TODO: Implement Stripe checkout creation
        // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        // const session = await stripe.checkout.sessions.create({...});
        // checkoutUrl = session.url;
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
        // Don't fail the onboarding if Stripe fails
      }
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        subdomain: organization.subdomain,
      },
      checkoutUrl,
      dashboardUrl: `/dashboard?org=${organization.id}`,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
