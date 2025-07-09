import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const PRICE_MAP = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  elite: process.env.STRIPE_ELITE_PRICE_ID!,
};

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { planId, organizationId } = await request.json();

    if (!PRICE_MAP[planId as keyof typeof PRICE_MAP]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get organization details
    const { data: organization } = await supabase
      .from("organizations")
      .select("id, name, subdomain")
      .eq("id", organizationId)
      .eq("owner_id", user.id)
      .single();

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: user.email!,
      name: user.user_metadata?.full_name || user.email!,
      metadata: {
        organization_id: organization.id,
        organization_name: organization.name,
      },
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRICE_MAP[planId as keyof typeof PRICE_MAP],
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?cancelled=true`,
      metadata: {
        organization_id: organization.id,
        plan: planId,
      },
      subscription_data: {
        metadata: {
          organization_id: organization.id,
          plan: planId,
        },
      },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
