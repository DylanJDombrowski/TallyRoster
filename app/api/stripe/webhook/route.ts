import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organization_id;
        const plan = session.metadata?.plan;

        if (organizationId && plan) {
          // Update organization with subscription details
          await supabase
            .from("organizations")
            .update({
              subscription_plan: plan,
              trial_ends_at: null, // Remove trial when they pay
            })
            .eq("id", organizationId);

          console.log(`Organization ${organizationId} activated with ${plan} plan`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organization_id;
        const plan = subscription.metadata?.plan;

        if (organizationId) {
          const status = subscription.status === "active" ? plan : "cancelled";

          await supabase
            .from("organizations")
            .update({
              subscription_plan: status,
            })
            .eq("id", organizationId);

          console.log(`Organization ${organizationId} subscription updated to ${status}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organization_id;

        if (organizationId) {
          await supabase
            .from("organizations")
            .update({
              subscription_plan: "cancelled",
            })
            .eq("id", organizationId);

          console.log(`Organization ${organizationId} subscription cancelled`);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
