// app/components/ThemeListener.tsx - Enhanced Version
"use client";

import { useEffect } from "react";

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
        const { name, logoUrl, primaryColor, secondaryColor }: ThemePayload = event.data.payload;

        console.log("Received theme update:", event.data.payload);

        // Update CSS variables
        if (primaryColor) {
          document.documentElement.style.setProperty("--color-primary", primaryColor);

          // Update all elements with primary color classes
          const primaryElements = document.querySelectorAll(".bg-primary");
          primaryElements.forEach((el) => {
            (el as HTMLElement).style.backgroundColor = primaryColor;
          });

          const primaryTextElements = document.querySelectorAll(".text-primary");
          primaryTextElements.forEach((el) => {
            (el as HTMLElement).style.color = primaryColor;
          });
        }

        if (secondaryColor) {
          document.documentElement.style.setProperty("--color-secondary", secondaryColor);

          // Update all elements with secondary color classes
          const secondaryElements = document.querySelectorAll(".bg-secondary");
          secondaryElements.forEach((el) => {
            (el as HTMLElement).style.backgroundColor = secondaryColor;
          });

          const secondaryTextElements = document.querySelectorAll(".text-secondary");
          secondaryTextElements.forEach((el) => {
            (el as HTMLElement).style.color = secondaryColor;
          });
        }

        // Update organization name if provided
        if (name) {
          document.documentElement.style.setProperty("--organization-name", `"${name}"`);

          // Update any text elements that show the organization name
          const nameElements = document.querySelectorAll("[data-org-name]");
          nameElements.forEach((el) => {
            el.textContent = name;
          });
        }

        // Update logo if provided
        if (logoUrl !== undefined) {
          const logoElements = document.querySelectorAll("[data-org-logo]") as NodeListOf<HTMLImageElement>;
          logoElements.forEach((img) => {
            if (logoUrl) {
              img.src = logoUrl;
              img.style.display = "block";
            } else {
              img.style.display = "none";
            }
          });
        }

        console.log("Theme update applied successfully");
      }
    };

    // Add event listener
    window.addEventListener("message", handleMessage);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return null; // This component renders nothing visible
}
