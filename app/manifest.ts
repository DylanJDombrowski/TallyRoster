import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TallyRoster - Team Management for Softball",
    short_name: "TallyRoster",
    description: "Professional team management and websites for softball organizations",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#161659",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
