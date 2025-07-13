// app/dashboard/site-customizer/components/customizer-form.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { Database } from "@/lib/database.types";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
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
  const [state, formAction] = useFormState(updateOrganizationSettings, initialState);
  const { showToast } = useToast();

  // State for all customizable fields
  const [name, setName] = useState(organization.name || "");
  const [slogan, setSlogan] = useState(organization.slogan || "");
  const [logoUrl, setLogoUrl] = useState(organization.logo_url || "");
  const [primaryColor, setPrimaryColor] = useState(organization.primary_color || "#161659");
  const [secondaryColor, setSecondaryColor] = useState(organization.secondary_color || "#BD1515");
  const [theme, setTheme] = useState(organization.theme || "light");

  useEffect(() => {
    if (state.message) {
      showToast(state.message, state.success ? "success" : "error");
    }
  }, [state, showToast]);

  const handlePresetSelect = (preset: (typeof COLOR_PRESETS)[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Left Panel: Controls */}
      <div className="space-y-8">
        {/* The form action is now directly handled by the form element */}
        <form action={formAction} className="space-y-8 p-6 border rounded-lg bg-white shadow-sm">
          {/* Hidden fields */}
          <input type="hidden" name="organizationId" value={organization.id} />
          <input type="hidden" name="subdomain" value={organization.subdomain || ""} />
          <input type="hidden" name="logo_url" value={logoUrl || ""} />

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
                />
              </div>
              {/* NEW: Slogan Input */}
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
            {/* NEW: Dark Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 mb-6">
              <label htmlFor="theme" className="font-medium text-slate-700">
                Dark Mode
              </label>
              <input
                type="checkbox"
                id="theme"
                name="theme_toggle"
                checked={theme === "dark"}
                onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
                className="toggle toggle-primary"
              />
              <input type="hidden" name="theme" value={theme} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {COLOR_PRESETS.map((preset) => (
                <button key={preset.name} type="button" onClick={() => handlePresetSelect(preset)} className={`p-3 rounded-lg border-2`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primary }} />
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.secondary }} />
                  </div>
                  <span className="text-xs font-medium text-slate-700">{preset.name}</span>
                </button>
              ))}
            </div>
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
