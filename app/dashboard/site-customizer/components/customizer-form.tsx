// app/dashboard/site-customizer/components/customizer-form.tsx
"use client";

import { useFormState } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { Database } from "@/lib/database.types";
import { updateOrganizationSettings } from "../actions";
import { ImageUploader } from "../../players/components/image-uploader";
import { useToast } from "@/app/components/toast-provider";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

interface CustomizerFormProps {
  organization: Organization;
}

const initialState = {
  success: false,
  message: "",
};

export function CustomizerForm({ organization }: CustomizerFormProps) {
  const [state, formAction] = useFormState(
    updateOrganizationSettings,
    initialState
  );
  const { showToast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // State for live preview
  const [name, setName] = useState(organization.name);
  const [logoUrl, setLogoUrl] = useState(organization.logo_url);
  const [primaryColor, setPrimaryColor] = useState(organization.primary_color);
  const [secondaryColor, setSecondaryColor] = useState(
    organization.secondary_color
  );

  // Post updates to the iframe for live preview
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "SIDELINE_THEME_UPDATE",
        payload: { name, logoUrl, primaryColor, secondaryColor },
      },
      "*" // In production, you'd restrict this to your site's URL
    );
  }, [name, logoUrl, primaryColor, secondaryColor]);

  // Show toast on form submission result
  useEffect(() => {
    if (state.message) {
      showToast(state.message, state.success ? "success" : "error");
    }
  }, [state, showToast]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Panel: Controls */}
      <div className="lg:col-span-1">
        <form
          action={formAction}
          className="space-y-8 p-6 border rounded-lg bg-white shadow-sm"
        >
          <input type="hidden" name="id" value={organization.id} />
          <input
            type="hidden"
            name="subdomain"
            value={organization.subdomain || ""}
          />
          <input type="hidden" name="logo_url" value={logoUrl || ""} />

          <div>
            <h3 className="text-lg font-semibold text-slate-700">Branding</h3>
            <div className="mt-4 space-y-4">
              <ImageUploader
                initialImageUrl={logoUrl}
                onUploadSuccess={(url) => setLogoUrl(url)}
              />
              <div>
                <label htmlFor="name">Organization Name</label>
                <input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-700">Colors</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="primary_color">Primary Color</label>
                <input
                  id="primary_color"
                  name="primary_color"
                  type="color"
                  value={primaryColor || "#000000"}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="secondary_color">Secondary Color</label>
                <input
                  id="secondary_color"
                  name="secondary_color"
                  type="color"
                  value={secondaryColor || "#000000"}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <button
              type="submit"
              className="w-full p-3 rounded-lg text-white font-bold bg-blue-600 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>

      {/* Right Panel: Live Preview */}
      <div className="lg:col-span-2">
        <div className="w-full h-[80vh] bg-slate-100 rounded-lg overflow-hidden border shadow-inner">
          <iframe
            ref={iframeRef}
            src={`/sites/${organization.subdomain}`}
            className="w-full h-full"
            title="Live Website Preview"
          />
        </div>
      </div>
    </div>
  );
}
