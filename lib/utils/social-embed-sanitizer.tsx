// lib/utils/social-embed-sanitizer.tsx
"use client";

import React, { useEffect, useRef } from "react";

// Known safe social media domains
const TRUSTED_SOCIAL_DOMAINS = [
  "platform.twitter.com",
  "connect.facebook.net",
  "www.instagram.com",
  "platform.instagram.com",
  "www.youtube.com",
  "platform.linkedin.com",
  "www.tiktok.com",
];

/**
 * Check if a script source is from a trusted social media domain
 */
function isTrustedScriptSource(src: string): boolean {
  try {
    const url = new URL(src);
    return TRUSTED_SOCIAL_DOMAINS.some(
      (domain) => url.hostname === domain || url.hostname.endsWith("." + domain)
    );
  } catch {
    return false;
  }
}

/**
 * Basic HTML sanitization for social media embeds
 */
export function sanitizeSocialEmbed(embedCode: string): string {
  if (!embedCode?.trim()) return "";

  // Remove any <script> tags that don't come from trusted sources
  const scriptRegex =
    /<script[^>]*src=["']([^"']+)["'][^>]*>[\s\S]*?<\/script>/gi;
  const sanitizedCode = embedCode.replace(scriptRegex, (match, src) => {
    if (isTrustedScriptSource(src)) {
      return match; // Keep trusted scripts
    }
    return ""; // Remove untrusted scripts
  });

  // Remove inline script tags (without src attribute)
  const inlineScriptRegex = /<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/gi;
  const noInlineScripts = sanitizedCode.replace(inlineScriptRegex, "");

  // Remove dangerous event handlers
  const dangerousEvents = /on\w+\s*=\s*["'][^"']*["']/gi;
  const noEventHandlers = noInlineScripts.replace(dangerousEvents, "");

  // Remove javascript: URLs
  const javascriptUrls = /javascript:[^"']*/gi;
  const noJavascriptUrls = noEventHandlers.replace(javascriptUrls, "#");

  return noJavascriptUrls.trim();
}

/**
 * React component for safely rendering social media embeds
 */
interface SafeSocialEmbedProps {
  embedCode: string;
  className?: string;
}

export function SafeSocialEmbed({
  embedCode,
  className = "",
}: SafeSocialEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !embedCode) return;

    const sanitizedCode = sanitizeSocialEmbed(embedCode);

    // Clear previous content
    containerRef.current.innerHTML = "";

    if (sanitizedCode) {
      // Create a temporary container to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = sanitizedCode;

      // Move all child nodes to the actual container
      while (tempDiv.firstChild) {
        containerRef.current.appendChild(tempDiv.firstChild);
      }

      // Execute any scripts that were added (from trusted sources only)
      const scripts = containerRef.current.querySelectorAll("script[src]");
      scripts.forEach((script) => {
        const newScript = document.createElement("script");
        newScript.src = script.getAttribute("src") || "";
        newScript.async = true;

        // Only execute if from trusted domain
        if (isTrustedScriptSource(newScript.src)) {
          document.head.appendChild(newScript);
        }
      });
    }
  }, [embedCode]);

  // This is the return you were looking for!
  if (!embedCode) {
    return (
      <div className={`text-center py-12 text-gray-500 ${className}`}>
        <p>No social media feed configured.</p>
        <p className="text-sm mt-2">
          Admins can add a social media embed code in the site customizer.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`social-embed-container ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
}
