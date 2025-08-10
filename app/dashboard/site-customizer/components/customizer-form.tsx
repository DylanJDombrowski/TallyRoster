// app/dashboard/site-customizer/components/customizer-form.tsx - UPDATED WITH PAGE VISIBILITY
"use client";

import { useToast } from "@/app/components/toast-provider";
import { Database } from "@/lib/database.types";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ImageUploader } from "../../players/components/image-uploader";
import { updateOrganizationSettings } from "@/lib/actions";
import { MiniPreview } from "./mini-preview";
import { Type } from "lucide-react";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

interface CustomizerFormProps {
  organization: Organization;
}

const initialState = { success: false, message: "" };

const THEME_PRESETS = [
  {
    name: "default",
    label: "Classic",
    colors: { primary: "#161659", secondary: "#BD1515" },
    description: "Traditional sports colors",
  },
  {
    name: "forest",
    label: "Forest",
    colors: { primary: "#22C55E", secondary: "#FDE047" },
    description: "Natural green tones",
  },
  {
    name: "ocean",
    label: "Ocean",
    colors: { primary: "#0EA5E9", secondary: "#38BDF8" },
    description: "Cool blue palette",
  },
  {
    name: "sunset",
    label: "Sunset",
    colors: { primary: "#EA580C", secondary: "#F97316" },
    description: "Warm orange hues",
  },
  {
    name: "royal",
    label: "Royal",
    colors: { primary: "#7C3AED", secondary: "#A855F7" },
    description: "Regal purple theme",
  },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full p-4 rounded-lg text-white font-bold text-lg bg-blue-600 transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Saving..." : "Save & Publish Changes"}
    </button>
  );
}

export function CustomizerForm({ organization }: CustomizerFormProps) {
  const [state, formAction] = useActionState(
    updateOrganizationSettings,
    initialState
  );
  const { showToast } = useToast();

  const lastMessageRef = useRef<string>("");
  const lastSuccessRef = useRef<boolean>(false);
  const [fontFamily, setFontFamily] = useState(
    organization.font_family || "Inter"
  );
  const [themeName, setThemeName] = useState(
    organization.theme_name || "default"
  );

  // State for all customizable fields
  const [name, setName] = useState(organization.name || "");
  const [slogan, setSlogan] = useState(organization.slogan || "");
  const [logoUrl, setLogoUrl] = useState(organization.logo_url || "");
  const [primaryColor, setPrimaryColor] = useState(
    organization.primary_color || "#161659"
  );
  const [secondaryColor, setSecondaryColor] = useState(
    organization.secondary_color || "#BD1515"
  );
  const [theme, setTheme] = useState(organization.theme || "light");

  // Page visibility states
  const [showAlumni, setShowAlumni] = useState(
    organization.show_alumni || false
  );
  const [showBlog, setShowBlog] = useState(organization.show_blog !== false); // Default true
  const [showFormsLinks, setShowFormsLinks] = useState(
    organization.show_forms_links !== false
  ); // Default true
  const [showSponsors, setShowSponsors] = useState(
    organization.show_sponsors || false
  );
  const [showSocial, setShowSocial] = useState(
    organization.show_social !== false
  ); // Default true

  // Navigation label states
  const [alumniNavLabel, setAlumniNavLabel] = useState(
    organization.alumni_nav_label || "Alumni"
  );
  const [blogNavLabel, setBlogNavLabel] = useState(
    organization.blog_nav_label || "News"
  );
  const [formsLinksNavLabel, setFormsLinksNavLabel] = useState(
    organization.forms_links_nav_label || "Forms & Links"
  );
  const [sponsorsNavLabel, setSponsorsNavLabel] = useState(
    organization.sponsors_nav_label || "Sponsors"
  );
  const [socialNavLabel, setSocialNavLabel] = useState(
    organization.social_nav_label || "Social"
  );
  const [facebookUrl, setFacebookUrl] = useState(
    organization.facebook_url || ""
  );
  const [twitterUrl, setTwitterUrl] = useState(organization.twitter_url || "");
  const [instagramUrl, setInstagramUrl] = useState(
    organization.instagram_url || ""
  );
  const [youtubeUrl, setYoutubeUrl] = useState(organization.youtube_url || "");
  const [linkedinUrl, setLinkedinUrl] = useState(
    organization.linkedin_url || ""
  );
  const [tiktokUrl, setTiktokUrl] = useState(organization.tiktok_url || "");
  const [socialEmbedCode, setSocialEmbedCode] = useState(
    organization.social_embed_code || ""
  );

  const FONT_OPTIONS = [
    { value: "Inter", label: "Inter", description: "Clean & Modern" },
    { value: "Roboto", label: "Roboto", description: "Google's Choice" },
    { value: "Poppins", label: "Poppins", description: "Friendly & Round" },
    { value: "Montserrat", label: "Montserrat", description: "Professional" },
    {
      value: "Playfair Display",
      label: "Playfair Display",
      description: "Elegant Serif",
    },
    { value: "Lora", label: "Lora", description: "Classic Serif" },
    { value: "Raleway", label: "Raleway", description: "Thin & Stylish" },
  ];

  useEffect(() => {
    if (
      state.message &&
      (state.message !== lastMessageRef.current ||
        state.success !== lastSuccessRef.current)
    ) {
      showToast(state.message, state.success ? "success" : "error");
      lastMessageRef.current = state.message;
      lastSuccessRef.current = state.success;
    }
  }, [state.message, state.success, showToast]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Left Panel: Controls */}
      <div className="space-y-8">
        <form
          action={formAction}
          className="space-y-8 p-6 border rounded-lg bg-white shadow-sm"
        >
          {/* Hidden fields */}
          <input type="hidden" name="organizationId" value={organization.id} />
          <input
            type="hidden"
            name="subdomain"
            value={organization.subdomain || ""}
          />
          <input type="hidden" name="logo_url" value={logoUrl || ""} />
          <input type="hidden" name="facebook_url" value={facebookUrl || ""} />
          <input type="hidden" name="twitter_url" value={twitterUrl || ""} />
          <input
            type="hidden"
            name="instagram_url"
            value={instagramUrl || ""}
          />
          <input type="hidden" name="youtube_url" value={youtubeUrl || ""} />
          <input type="hidden" name="linkedin_url" value={linkedinUrl || ""} />
          <input type="hidden" name="tiktok_url" value={tiktokUrl || ""} />
          <input
            type="hidden"
            name="social_embed_code"
            value={socialEmbedCode || ""}
          />

          {/* Branding Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4">
              Branding
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Organization Logo
                </label>
                <ImageUploader
                  initialImageUrl={logoUrl}
                  onUploadSuccess={setLogoUrl}
                  uploadPreset="organization_logos"
                />
              </div>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Organization Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="slogan"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Slogan / Tagline
                </label>
                <input
                  id="slogan"
                  name="slogan"
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-md"
                  placeholder="Excellence in Sports"
                />
              </div>
            </div>
          </div>

          {/* Color & Theme Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">
              Color & Theme
            </h3>

            <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 mb-6">
              <label
                htmlFor="theme_toggle"
                className="font-medium text-slate-700"
              >
                Dark Mode
              </label>
              <input
                type="checkbox"
                id="theme_toggle"
                checked={theme === "dark"}
                onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
                className="toggle toggle-primary"
              />
              <input type="hidden" name="theme" value={theme} />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">
                Theme Selection
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {THEME_PRESETS.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => setThemeName(theme.name)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      themeName === theme.name
                        ? "border-blue-500 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">
                        {theme.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {theme.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <input type="hidden" name="theme_name" value={themeName} />
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="primary_color"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    id="primary_color"
                    name="primary_color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-12 p-1 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 p-3 border border-slate-300 rounded-md font-mono"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="secondary_color"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    id="secondary_color"
                    name="secondary_color"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-16 h-12 p-1 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 p-3 border border-slate-300 rounded-md font-mono"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">
              Typography
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Choose a font that matches your organization&apos;s personality
            </p>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Website Font Family
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.value}
                    type="button"
                    onClick={() => setFontFamily(font.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      fontFamily === font.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Type
                        className={`w-5 h-5 mt-0.5 ${
                          fontFamily === font.value
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      />
                      <div className="flex-1">
                        <div
                          className="font-semibold text-gray-900"
                          style={{
                            fontFamily: `var(--font-${font.value
                              .toLowerCase()
                              .replace(/\s+/g, "-")})`,
                          }}
                        >
                          {font.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {font.description}
                        </div>
                        <div
                          className="text-sm text-gray-600 mt-2"
                          style={{
                            fontFamily: `var(--font-${font.value
                              .toLowerCase()
                              .replace(/\s+/g, "-")})`,
                          }}
                        >
                          The quick brown fox jumps over the lazy dog
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hidden input for form submission */}
            <input type="hidden" name="font_family" value={fontFamily} />
          </div>

          {/* Page Visibility Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">
              Page Visibility & Navigation
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Control which pages appear in your public website navigation and
              customize their labels.
            </p>

            <div className="space-y-6">
              {/* Alumni */}
              <div className="flex items-start space-x-4 p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show_alumni"
                    name="show_alumni"
                    checked={showAlumni}
                    onChange={(e) => setShowAlumni(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="show_alumni"
                    className="ml-2 text-sm font-medium text-slate-700"
                  >
                    Alumni Page
                  </label>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    name="alumni_nav_label"
                    value={alumniNavLabel}
                    onChange={(e) => setAlumniNavLabel(e.target.value)}
                    disabled={!showAlumni}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Alumni"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Navigation label (e.g., &quot;Hall of Fame&quot;)
                  </p>
                </div>
              </div>

              {/* Blog */}
              <div className="flex items-start space-x-4 p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show_blog"
                    name="show_blog"
                    checked={showBlog}
                    onChange={(e) => setShowBlog(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="show_blog"
                    className="ml-2 text-sm font-medium text-slate-700"
                  >
                    Blog/News Page
                  </label>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    name="blog_nav_label"
                    value={blogNavLabel}
                    onChange={(e) => setBlogNavLabel(e.target.value)}
                    disabled={!showBlog}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="News"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Navigation label (e.g., &quot;On The Field&quot;)
                  </p>
                </div>
              </div>

              {/* Forms & Links */}
              <div className="flex items-start space-x-4 p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show_forms_links"
                    name="show_forms_links"
                    checked={showFormsLinks}
                    onChange={(e) => setShowFormsLinks(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="show_forms_links"
                    className="ml-2 text-sm font-medium text-slate-700"
                  >
                    Forms & Links Page
                  </label>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    name="forms_links_nav_label"
                    value={formsLinksNavLabel}
                    onChange={(e) => setFormsLinksNavLabel(e.target.value)}
                    disabled={!showFormsLinks}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Forms & Links"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Navigation label (e.g., &quot;All Aboard&quot;)
                  </p>
                </div>
              </div>

              {/* Sponsors */}
              <div className="flex items-start space-x-4 p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show_sponsors"
                    name="show_sponsors"
                    checked={showSponsors}
                    onChange={(e) => setShowSponsors(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="show_sponsors"
                    className="ml-2 text-sm font-medium text-slate-700"
                  >
                    Sponsors/Partners Page
                  </label>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    name="sponsors_nav_label"
                    value={sponsorsNavLabel}
                    onChange={(e) => setSponsorsNavLabel(e.target.value)}
                    disabled={!showSponsors}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Sponsors"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Navigation label (e.g., &quot;Our Partners&quot;)
                  </p>
                </div>
              </div>

              {/* Social */}
              <div className="flex items-start space-x-4 p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show_social"
                    name="show_social"
                    checked={showSocial}
                    onChange={(e) => setShowSocial(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="show_social"
                    className="ml-2 text-sm font-medium text-slate-700"
                  >
                    Social Media Page
                  </label>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    name="social_nav_label"
                    value={socialNavLabel}
                    onChange={(e) => setSocialNavLabel(e.target.value)}
                    disabled={!showSocial}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Social"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Navigation label (e.g., &quot;Xpress Social&quot;)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Integration Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">
              Social Media Integration
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Add your social media links to display in the footer and
              optionally embed a social media feed on your social page.
            </p>

            <div className="space-y-4">
              {/* Social Media Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="facebook_url"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Facebook Page URL
                  </label>
                  <input
                    id="facebook_url"
                    name="facebook_url"
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-md"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div>
                  <label
                    htmlFor="twitter_url"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Twitter/X Profile URL
                  </label>
                  <input
                    id="twitter_url"
                    name="twitter_url"
                    type="url"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-md"
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>

                <div>
                  <label
                    htmlFor="instagram_url"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Instagram Profile URL
                  </label>
                  <input
                    id="instagram_url"
                    name="instagram_url"
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-md"
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>

                <div>
                  <label
                    htmlFor="youtube_url"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    YouTube Channel URL
                  </label>
                  <input
                    id="youtube_url"
                    name="youtube_url"
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-md"
                    placeholder="https://youtube.com/c/yourchannel"
                  />
                </div>

                <div>
                  <label
                    htmlFor="linkedin_url"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    LinkedIn Profile URL
                  </label>
                  <input
                    id="linkedin_url"
                    name="linkedin_url"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-md"
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>

                <div>
                  <label
                    htmlFor="tiktok_url"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    TikTok Profile URL
                  </label>
                  <input
                    id="tiktok_url"
                    name="tiktok_url"
                    type="url"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-md"
                    placeholder="https://tiktok.com/@yourusername"
                  />
                </div>
              </div>

              {/* Social Media Embed Code */}
              <div className="mt-6">
                <label
                  htmlFor="social_embed_code"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Social Media Feed Embed Code (Optional)
                </label>
                <textarea
                  id="social_embed_code"
                  name="social_embed_code"
                  rows={6}
                  value={socialEmbedCode}
                  onChange={(e) => setSocialEmbedCode(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-md font-mono text-sm"
                  placeholder="Paste your social media embed code here (e.g., Twitter timeline widget, Facebook page plugin, etc.)"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Get embed codes from your social media platforms to display
                  live feeds on your social page. Common examples: Twitter
                  timeline widget, Facebook page plugin, Instagram feed widget.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <SubmitButton />
            <p className="text-xs text-slate-500 mt-2 text-center">
              Changes will be visible on your live website immediately.
            </p>
          </div>
        </form>
      </div>

      {/* Right Panel: Mini Preview */}
      <div className="xl:sticky xl:top-6 xl:h-fit">
        <MiniPreview
          name={name}
          slogan={slogan}
          logoUrl={logoUrl}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          theme={theme}
          organization={organization}
          navigationConfig={{
            showAlumni,
            showBlog,
            showFormsLinks,
            showSponsors,
            showSocial,
            alumniNavLabel,
            blogNavLabel,
            formsLinksNavLabel,
            sponsorsNavLabel,
            socialNavLabel,
          }}
        />
      </div>
    </div>
  );
}
