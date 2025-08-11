// app/components/onboarding/steps/VisualCustomizationStep.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import {
  ColorPreset,
  OnboardingStepProps,
  VisualCustomizationData,
} from "@/lib/types";
import Image from "next/image";
import { useRef, useState } from "react";

const PRESET_COLORS: ColorPreset[] = [
  { name: "Royal Blue", primary: "#1e40af", secondary: "#3b82f6" },
  { name: "Forest Green", primary: "#166534", secondary: "#22c55e" },
  { name: "Crimson Red", primary: "#dc2626", secondary: "#ef4444" },
  { name: "Purple", primary: "#7c3aed", secondary: "#a855f7" },
  { name: "Orange", primary: "#ea580c", secondary: "#f97316" },
  { name: "Teal", primary: "#0d9488", secondary: "#14b8a6" },
];

export function VisualCustomizationStep({
  onNext,
  onBack,
  data,
}: OnboardingStepProps) {
  const [formData, setFormData] = useState<VisualCustomizationData>({
    primaryColor: data.primaryColor || "#1e40af",
    secondaryColor: data.secondaryColor || "#3b82f6",
    logo: data.logo || null,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(
    data.logoPreview || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleColorPreset = (preset: ColorPreset): void => {
    setFormData((prev) => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
    }));
  };

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      showToast("File size must be under 5MB", "error");
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // TODO: Upload to storage (Supabase Storage or similar)
      // For now, we'll just store the file reference
      setFormData((prev) => ({ ...prev, logo: file }));

      showToast("Logo uploaded successfully!", "success");
    } catch (error) {
      console.error("Logo upload error:", error);
      showToast("Error uploading logo", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const removeLogo = (): void => {
    setFormData((prev) => ({ ...prev, logo: null }));
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (): void => {
    onNext({
      ...formData,
      logoPreview, // Include preview for next steps
    });
  };

  return (
    <div className="space-y-8">
      {/* Color Selection */}
      <div>
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Choose Your Team Colors
        </h3>

        {/* Color Presets */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleColorPreset(preset)}
              className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                formData.primaryColor === preset.primary
                  ? "border-slate-900 ring-2 ring-slate-900 ring-offset-2"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: preset.primary }}
                />
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: preset.secondary }}
                />
              </div>
              <span className="text-sm font-medium text-slate-700">
                {preset.name}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Color Pickers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    primaryColor: e.target.value,
                  }))
                }
                className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    primaryColor: e.target.value,
                  }))
                }
                placeholder="#1e40af"
                className="flex-1 p-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    secondaryColor: e.target.value,
                  }))
                }
                className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    secondaryColor: e.target.value,
                  }))
                }
                placeholder="#3b82f6"
                className="flex-1 p-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Upload Your Team Logo
        </h3>

        {!logoPreview ? (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex flex-col items-center"
            >
              <svg
                className="w-12 h-12 text-slate-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-lg font-medium text-slate-600 mb-2">
                {isUploading ? "Uploading..." : "Click to upload logo"}
              </span>
              <span className="text-sm text-slate-500">PNG, JPG up to 5MB</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
            <Image
              src={logoPreview}
              alt="Logo preview"
              width={64}
              height={64}
              className="object-contain rounded-lg"
            />
            <div className="flex-1">
              <p className="font-medium text-slate-900">Logo uploaded</p>
              <p className="text-sm text-slate-500">Looking great!</p>
            </div>
            <button
              onClick={removeLogo}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Remove
            </button>
          </div>
        )}

        <p className="text-sm text-slate-600 mt-2">
          Don&apos;t have a logo? No problem! You can add one later.
        </p>
      </div>

      {/* Live Preview */}
      <div>
        <h3 className="text-lg font-medium text-slate-900 mb-4">Preview</h3>
        <div
          className="p-6 rounded-lg border-2"
          style={{
            background: `linear-gradient(135deg, ${formData.primaryColor}15 0%, ${formData.secondaryColor}15 100%)`,
            borderColor: formData.primaryColor,
          }}
        >
          <div className="flex items-center space-x-4 mb-4">
            {logoPreview && (
              <Image
                src={logoPreview}
                alt="Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            )}
            <div>
              <h4
                className="text-xl font-bold"
                style={{ color: formData.primaryColor }}
              >
                {data.organizationName || "Your Team Name"}
              </h4>
              <p className="text-slate-600">{data.sport || "Sport"}</p>
            </div>
          </div>
          <div
            className="inline-block px-4 py-2 rounded-md text-white font-medium"
            style={{ backgroundColor: formData.primaryColor }}
          >
            Sample Button
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          Continue to Preview
        </button>
      </div>
    </div>
  );
}
