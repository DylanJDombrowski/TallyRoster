// app/dashboard/site-customizer/components/customizer-form.tsx - Enhanced with Mini Preview
"use client";

import { useToast } from "@/app/components/toast-provider";
import { Database } from "@/lib/database.types";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { ImageUploader } from "../../players/components/image-uploader";
import { updateOrganizationSettings } from "../actions";
import { MiniPreview } from "./mini-preview";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

interface CustomizerFormProps {
  organization: Organization;
}

const initialState = {
  success: false,
  message: "",
};

// Predefined color palettes
const COLOR_PRESETS = [
  { name: "Classic Blue & Red", primary: "#161659", secondary: "#BD1515" },
  { name: "Forest Green", primary: "#166534", secondary: "#22C55E" },
  { name: "Royal Purple", primary: "#7C3AED", secondary: "#A855F7" },
  { name: "Ocean Blue", primary: "#0EA5E9", secondary: "#38BDF8" },
  { name: "Sunset Orange", primary: "#EA580C", secondary: "#F97316" },
  { name: "Crimson Red", primary: "#DC2626", secondary: "#EF4444" },
  { name: "Professional Navy", primary: "#1E3A8A", secondary: "#3B82F6" },
  { name: "Emerald Green", primary: "#059669", secondary: "#10B981" },
];

export function CustomizerForm({ organization }: CustomizerFormProps) {
  const [state, formAction] = useFormState(updateOrganizationSettings, initialState);
  const { showToast } = useToast();

  // Initialize with actual organization values or defaults
  const [name, setName] = useState(organization.name || "");
  const [logoUrl, setLogoUrl] = useState(organization.logo_url || "");
  const [primaryColor, setPrimaryColor] = useState(organization.primary_color || "#161659");
  const [secondaryColor, setSecondaryColor] = useState(organization.secondary_color || "#BD1515");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when organization changes (for proper initialization)
  useEffect(() => {
    setName(organization.name || "");
    setLogoUrl(organization.logo_url || "");
    setPrimaryColor(organization.primary_color || "#161659");
    setSecondaryColor(organization.secondary_color || "#BD1515");
  }, [organization]);

  // Show toast on form submission result
  useEffect(() => {
    if (state.message) {
      showToast(state.message, state.success ? "success" : "error");
      setIsSubmitting(false);
    }
  }, [state, showToast]);

  // Handle color preset selection
  const handlePresetSelect = (preset: (typeof COLOR_PRESETS)[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
  };

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    // Ensure all current values are in the form data
    formData.set("id", organization.id);
    formData.set("name", name);
    formData.set("logo_url", logoUrl || "");
    formData.set("primary_color", primaryColor);
    formData.set("secondary_color", secondaryColor);
    formData.set("subdomain", organization.subdomain || "");

    console.log("Submitting form with data:", {
      id: organization.id,
      name,
      logo_url: logoUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      subdomain: organization.subdomain,
    });

    formAction(formData);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Left Panel: Controls */}
      <div className="space-y-8">
        <form action={handleSubmit} className="space-y-8 p-6 border rounded-lg bg-white shadow-sm">
          {/* Hidden fields */}
          <input type="hidden" name="id" value={organization.id} />
          <input type="hidden" name="subdomain" value={organization.subdomain || ""} />

          {/* Branding Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Branding</h3>
            <div className="space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Organization Logo</label>
                <ImageUploader
                  initialImageUrl={logoUrl}
                  onUploadSuccess={(url) => {
                    console.log("Logo uploaded:", url);
                    setLogoUrl(url);
                  }}
                  uploadPreset="organization_logos"
                />
              </div>

              {/* Organization Name */}
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
                  className="w-full p-3 border border-slate-300 rounded-md shadow-sm text-slate-900 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your Organization Name"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Color Presets */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Color Presets</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    primaryColor === preset.primary && secondaryColor === preset.secondary
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primary }} />
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.secondary }} />
                  </div>
                  <span className="text-xs font-medium text-slate-700">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Custom Colors</h3>
            <div className="space-y-4">
              {/* Primary Color */}
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
                    className="w-16 h-12 border border-slate-300 rounded-lg cursor-pointer"
                    disabled={isSubmitting}
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 p-3 border border-slate-300 rounded-md text-sm font-mono"
                    placeholder="#161659"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Secondary Color */}
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
                    className="w-16 h-12 border border-slate-300 rounded-lg cursor-pointer"
                    disabled={isSubmitting}
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 p-3 border border-slate-300 rounded-md text-sm font-mono"
                    placeholder="#BD1515"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full p-4 rounded-lg text-white font-bold text-lg bg-blue-600 transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving Changes...
                </div>
              ) : (
                "Save & Publish Changes"
              )}
            </button>
            <p className="text-xs text-slate-500 mt-2 text-center">Changes will be visible on your live website immediately</p>
          </div>
        </form>
      </div>

      {/* Right Panel: Mini Preview */}
      <div className="xl:sticky xl:top-6 xl:h-fit">
        <MiniPreview
          name={name}
          logoUrl={logoUrl}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          organization={organization}
        />
      </div>
    </div>
  );
}
