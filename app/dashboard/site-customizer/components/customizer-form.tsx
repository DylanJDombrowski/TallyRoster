// app/dashboard/site-customizer/components/customizer-form.tsx - FIXED
"use client";

import { useToast } from "@/app/components/toast-provider";
import { Database } from "@/lib/database.types";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ImageUploader } from "../../players/components/image-uploader";
import { updateOrganizationSettings } from "../actions";
import { MiniPreview } from "./mini-preview";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

interface CustomizerFormProps {
  organization: Organization;
}

const initialState = { success: false, message: "" };

const COLOR_PRESETS = [
  { name: "Classic Blue & Red", primary: "#161659", secondary: "#BD1515" },
  { name: "Forest Green", primary: "#166534", secondary: "#22C55E" },
  { name: "Royal Purple", primary: "#7C3AED", secondary: "#A855F7" },
  { name: "Ocean Blue", primary: "#0EA5E9", secondary: "#38BDF8" },
  { name: "Sunset Orange", primary: "#EA580C", secondary: "#F97316" },
  { name: "Crimson Red", primary: "#DC2626", secondary: "#EF4444" },
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
  // FIXED: Use useActionState instead of useFormState
  const [state, formAction] = useActionState(updateOrganizationSettings, initialState);
  const { showToast } = useToast();

  // FIXED: Track if we've already shown the toast for this state
  const lastMessageRef = useRef<string>("");
  const lastSuccessRef = useRef<boolean>(false);

  // State for all customizable fields with better defaults
  const [name, setName] = useState(organization.name || "");
  const [slogan, setSlogan] = useState(organization.slogan || "");
  const [logoUrl, setLogoUrl] = useState(organization.logo_url || "");
  const [primaryColor, setPrimaryColor] = useState(organization.primary_color || "#161659");
  const [secondaryColor, setSecondaryColor] = useState(organization.secondary_color || "#BD1515");
  const [theme, setTheme] = useState(organization.theme || "light");

  // Debug: Log the organization data when component mounts
  useEffect(() => {
    console.log("🎨 CustomizerForm - Organization data:", {
      id: organization.id,
      name: organization.name,
      slogan: organization.slogan,
      theme: organization.theme,
      primary_color: organization.primary_color,
      secondary_color: organization.secondary_color,
      logo_url: organization.logo_url,
    });
  }, [organization]);

  // FIXED: Prevent infinite loop by checking if message has changed
  useEffect(() => {
    if (state.message && (state.message !== lastMessageRef.current || state.success !== lastSuccessRef.current)) {
      console.log("🎨 Form submission result:", state);
      showToast(state.message, state.success ? "success" : "error");

      // Update the refs to prevent showing the same message again
      lastMessageRef.current = state.message;
      lastSuccessRef.current = state.success;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.message, state.success, showToast]);

  const handlePresetSelect = (preset: (typeof COLOR_PRESETS)[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Left Panel: Controls */}
      <div className="space-y-8">
        <form action={formAction} className="space-y-8 p-6 border rounded-lg bg-white shadow-sm">
          {/* Hidden fields - CRITICAL: These must be present */}
          <input type="hidden" name="organizationId" value={organization.id} />
          <input type="hidden" name="subdomain" value={organization.subdomain || ""} />
          <input type="hidden" name="logo_url" value={logoUrl || ""} />

          {/* Debug section - Remove this after testing */}
          <div className="bg-gray-100 p-4 rounded text-xs">
            <strong>Debug Info:</strong>
            <br />
            Org ID: {organization.id}
            <br />
            Subdomain: {organization.subdomain}
            <br />
            Current Theme: {organization.theme}
            <br />
            Current Colors: {organization.primary_color} / {organization.secondary_color}
            <br />
            State: {JSON.stringify(state)}
          </div>

          {/* Branding Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Branding</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Organization Logo</label>
                <ImageUploader initialImageUrl={logoUrl} onUploadSuccess={setLogoUrl} uploadPreset="organization_logos" />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
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
                <label htmlFor="slogan" className="block text-sm font-medium text-slate-700 mb-1">
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
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Color & Theme</h3>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 mb-6">
              <label htmlFor="theme_toggle" className="font-medium text-slate-700">
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

            {/* Color Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className="p-3 rounded-lg border-2 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primary }} />
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.secondary }} />
                  </div>
                  <span className="text-xs font-medium text-slate-700">{preset.name}</span>
                </button>
              ))}
            </div>

            {/* Custom Color Inputs */}
            <div className="space-y-4">
              <div>
                <label htmlFor="primary_color" className="block text-sm font-medium text-slate-700 mb-2">
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
                <label htmlFor="secondary_color" className="block text-sm font-medium text-slate-700 mb-2">
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

          <div className="border-t pt-6">
            <SubmitButton />
            <p className="text-xs text-slate-500 mt-2 text-center">Changes will be visible on your live website immediately.</p>
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
        />
      </div>
    </div>
  );
}
