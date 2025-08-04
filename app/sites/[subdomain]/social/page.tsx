// app/sites/[subdomain]/social/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SafeSocialEmbed } from "@/lib/utils/social-embed-sanitizer";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";
import { Metadata } from "next";

type Props = {
  params: Promise<{ subdomain: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: organization } = await supabase
    .from("organizations")
    .select("name, social_nav_label")
    .eq("subdomain", subdomain)
    .single();

  const pageTitle = organization?.social_nav_label || "Social";
  const orgName = organization?.name || "Organization";

  return {
    title: `${pageTitle} | ${orgName}`,
    description: `Follow ${orgName} on social media and stay connected with all the latest updates, news, and highlights.`,
  };
}

export default async function SocialPage({ params }: Props) {
  const { subdomain } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get organization data
  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("*")
    .eq("subdomain", subdomain)
    .single();

  if (orgError || !organization) {
    notFound();
  }

  // Check if social page is enabled
  if (!organization.show_social) {
    notFound();
  }

  const pageTitle = organization.social_nav_label || "Social";
  const primaryColor = organization.primary_color || "#161659";
  const secondaryColor = organization.secondary_color || "#BD1515";

  // Prepare social media links
  const socialLinks = [
    {
      name: "Facebook",
      url: organization.facebook_url,
      icon: Facebook,
      color: "#1877F2",
      description:
        "Follow us on Facebook for daily updates and community highlights",
    },
    {
      name: "Twitter",
      url: organization.twitter_url,
      icon: Twitter,
      color: "#1DA1F2",
      description: "Get real-time updates and join the conversation on Twitter",
    },
    {
      name: "Instagram",
      url: organization.instagram_url,
      icon: Instagram,
      color: "#E4405F",
      description: "See behind-the-scenes photos and stories on Instagram",
    },
    {
      name: "YouTube",
      url: organization.youtube_url,
      icon: Youtube,
      color: "#FF0000",
      description: "Watch game highlights and exclusive videos on YouTube",
    },
    {
      name: "LinkedIn",
      url: organization.linkedin_url,
      icon: Linkedin,
      color: "#0A66C2",
      description: "Connect with us professionally on LinkedIn",
    },
    {
      name: "TikTok",
      url: organization.tiktok_url,
      icon: () => (
        <svg
          className="w-8 h-8"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
      color: "#000000",
      description: "Follow our fun and creative content on TikTok",
    },
  ];

  const activeSocialLinks = socialLinks.filter((link) => link.url);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="py-16 text-white"
        style={{
          backgroundColor: secondaryColor,
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{pageTitle}</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Stay connected with {organization.name} across all social media
              platforms
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Social Media Links Grid */}
        {activeSocialLinks.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Follow Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {activeSocialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center border-2 border-transparent hover:border-opacity-20"
                    style={{
                      borderColor: `${social.color}20`,
                    }}
                  >
                    <div
                      className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: social.color }}
                    >
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {social.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {social.description}
                    </p>
                    <div className="mt-4">
                      <span
                        className="inline-flex items-center px-4 py-2 rounded-full text-white text-sm font-medium group-hover:shadow-lg transition-shadow duration-300"
                        style={{ backgroundColor: social.color }}
                      >
                        Follow Us
                        <svg
                          className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Social Media Embed Feed */}
        {organization.social_embed_code ? (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Latest Updates
            </h2>
            <div className="max-w-4xl mx-auto">
              <SafeSocialEmbed
                embedCode={organization.social_embed_code}
                className="bg-white rounded-lg shadow-lg p-6"
              />
            </div>
          </div>
        ) : activeSocialLinks.length === 0 ? (
          // Empty state when no social links or embed code
          <div className="text-center py-16">
            <div
              className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <svg
                className="w-12 h-12"
                style={{ color: primaryColor }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a3 3 0 01-3-3V4a3 3 0 013-3h6a3 3 0 013 3v4z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Coming Soon!
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We&apos;re working on connecting our social media channels. Check
              back soon for updates and content from {organization.name}!
            </p>
          </div>
        ) : null}

        {/* Call to Action */}
        {activeSocialLinks.length > 0 && (
          <div
            className="rounded-lg p-8 text-white text-center"
            style={{ backgroundColor: primaryColor }}
          >
            <h3 className="text-2xl font-bold mb-4">
              Join the {organization.name} Community
            </h3>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Don&apos;t miss out on the latest news, game highlights, team
              updates, and behind-the-scenes content. Follow us on your favorite
              platform!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {activeSocialLinks.slice(0, 3).map((social) => (
                <a
                  key={social.name}
                  href={social.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white font-medium transition-all duration-300 hover:scale-105"
                >
                  <social.icon className="w-4 h-4 mr-2" />
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
