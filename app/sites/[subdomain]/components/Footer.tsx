// app/sites/[subdomain]/components/Footer.tsx
import { Database } from "@/lib/database.types";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

interface FooterProps {
  organization: Organization;
}

export function Footer({ organization }: FooterProps) {
  const socialLinks = [
    {
      name: "Facebook",
      url: organization.facebook_url,
      icon: Facebook,
      color: "#1877F2",
    },
    {
      name: "Twitter",
      url: organization.twitter_url,
      icon: Twitter,
      color: "#1DA1F2",
    },
    {
      name: "Instagram",
      url: organization.instagram_url,
      icon: Instagram,
      color: "#E4405F",
    },
    {
      name: "YouTube",
      url: organization.youtube_url,
      icon: Youtube,
      color: "#FF0000",
    },
    {
      name: "LinkedIn",
      url: organization.linkedin_url,
      icon: Linkedin,
      color: "#0A66C2",
    },
    {
      name: "TikTok",
      url: organization.tiktok_url,
      icon: () => (
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
      color: "#000000",
    },
  ];

  const activeSocialLinks = socialLinks.filter((link) => link.url);

  return (
    <footer
      className="font-oswald text-white py-10 px-5"
      style={{ backgroundColor: organization.secondary_color || "#BD1515" }}
    >
      <div className="max-w-screen-xl mx-auto text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{organization.name}</h2>
          <p className="opacity-90">
            {organization.slogan || "Excellence in Sports"}
          </p>
        </div>

        {/* Social Media Links */}
        {activeSocialLinks.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-center items-center space-x-6">
              {activeSocialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <div
                      className="p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <IconComponent className="w-6 h-6 text-white group-hover:text-opacity-80 transition-colors" />
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      {social.name}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div className="border-t border-white/20 pt-6">
          <p className="text-sm">
            © {new Date().getFullYear()} {organization.name}. All Rights
            Reserved.
          </p>
          {organization.subdomain && (
            <p className="text-xs opacity-75 mt-1">Powered by TallyRoster</p>
          )}
        </div>
      </div>
    </footer>
  );
}
