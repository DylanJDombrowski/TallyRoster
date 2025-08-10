// lib/actions/notifications.ts
"use server";

import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:your-email@example.com", // Replace with your email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// In production, you'd store these in your database
import type { PushSubscription as WebPushSubscription } from "web-push";
let subscriptions: WebPushSubscription[] = [];

export async function subscribeUser(sub: WebPushSubscription) {
  subscriptions.push(sub);
  // TODO: Store in Supabase
  // await supabase.from('push_subscriptions').insert({ subscription: sub })
  return { success: true };
}

export async function unsubscribeUser() {
  subscriptions = [];
  // TODO: Remove from Supabase
  return { success: true };
}

export async function sendNotification(message: string) {
  if (subscriptions.length === 0) {
    throw new Error("No subscriptions available");
  }

  try {
    const promises = subscriptions.map((subscription) =>
      webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "TallyRoster Update",
          body: message,
          icon: "/icons/icon-192x192.png",
        })
      )
    );

    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
