"use client";

import { useEffect, useState } from "react";
import { sendNotification, subscribeUser, unsubscribeUser } from "../actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message);
      setMessage("");
    }
  }

  if (!isSupported) {
    return null; // Hide if not supported
  }

  return (
    <div className="bg-gray-50 border rounded-lg p-4 m-4">
      <h3 className="font-bold mb-2">Team Notifications</h3>
      {subscription ? (
        <div className="space-y-2">
          <p className="text-green-600 text-sm">✅ You&apos;ll receive game updates and announcements</p>
          <button onClick={unsubscribeFromPush} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
            Turn Off Notifications
          </button>

          {/* Admin test interface - remove in production */}
          <div className="border-t pt-2">
            <input
              type="text"
              placeholder="Test notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded text-sm"
            />
            <button onClick={sendTestNotification} className="bg-blue-500 text-white px-3 py-1 rounded text-sm mt-1">
              Send Test
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-600 text-sm">Get notified about game updates, schedule changes, and team announcements</p>
          <button onClick={subscribeToPush} className="bg-blue-600 text-white px-4 py-2 rounded">
            Enable Notifications
          </button>
        </div>
      )}
    </div>
  );
}
