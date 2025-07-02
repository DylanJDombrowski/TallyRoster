// app/components/ThemeListener.tsx
"use client";

import { useEffect } from "react";

// Define the shape of the theme data we expect to receive
interface ThemePayload {
  name?: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export function ThemeListener() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Basic security: check the message type
      if (event.data.type === "SIDELINE_THEME_UPDATE") {
        const { primaryColor, secondaryColor }: ThemePayload =
          event.data.payload;

        if (primaryColor) {
          document.documentElement.style.setProperty(
            "--color-primary",
            primaryColor
          );
        }
        if (secondaryColor) {
          document.documentElement.style.setProperty(
            "--color-secondary",
            secondaryColor
          );
        }
        // You could also update the document title or a logo here if needed
      }
    };

    window.addEventListener("message", handleMessage);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return null; // This component renders nothing visible
}
