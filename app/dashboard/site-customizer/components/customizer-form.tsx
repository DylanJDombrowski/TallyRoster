// app/dashboard/site-customizer/components/customizer-form.tsx - FIXED VERSION
"use client";

import { useToast } from "@/app/components/toast-provider";
import { Database } from "@/lib/database.types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { ImageUploader } from "../../players/components/image-uploader";
import { updateOrganizationSettings } from "../actions";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

interface CustomizerFormProps {
  organization: Organization;
}

const initialState = {
  success: false,
  message: "",
};

export function CustomizerForm({ organization }: CustomizerFormProps) {
  const [state, formAction] = useFormState(updateOrganizationSettings, initialState);
  const { showToast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // State for live preview
  const [name, setName] = useState(organization.name);
  const [logoUrl, setLogoUrl] = useState(organization.logo_url);
  const [primaryColor, setPrimaryColor] = useState(organization.primary_color);
  const [secondaryColor, setSecondaryColor] = useState(organization.secondary_color);

  // Prevent message spam
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced message posting to prevent spam
  const postThemeUpdate = useCallback(() => {
    const now = Date.now();
    if (now - lastMessageTime < 100) return; // Throttle to max 10 messages per second

    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          {
            type: "SIDELINE_THEME_UPDATE",
            payload: { name, logoUrl, primaryColor, secondaryColor },
          },
          "*"
        );
        setLastMessageTime(now);
      } catch (error) {
        console.log("Preview update failed:", error);
      }
    }
  }, [name, logoUrl, primaryColor, secondaryColor, lastMessageTime]);

  // Post updates to the iframe for live preview (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(postThemeUpdate, 300); // Debounce for 300ms
    return () => clearTimeout(timeoutId);
  }, [postThemeUpdate]);

  // Show toast on form submission result
  useEffect(() => {
    if (state.message) {
      showToast(state.message, state.success ? "success" : "error");
      setIsSubmitting(false);

      // NO IFRAME RELOAD - let the revalidatePath handle the updates
      // The public site will update automatically due to server-side revalidation
    }
  }, [state, showToast]);

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    // Add current state values to form data
    formData.set("name", name);
    formData.set("logo_url", logoUrl || "");
    formData.set("primary_color", primaryColor || "#161659");
    formData.set("secondary_color", secondaryColor || "#BD1515");

    // Call the server action
    formAction(formData);
  };

  // Handle iframe load (only send initial message, no reloads)
  const handleIframeLoad = useCallback(() => {
    // Wait a bit for iframe to fully load, then send initial theme
    setTimeout(() => {
      postThemeUpdate();
    }, 1000);
  }, [postThemeUpdate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Panel: Controls */}
      <div className="lg:col-span-1">
        <form action={handleSubmit} className="space-y-8 p-6 border rounded-lg bg-white shadow-sm">
          <input type="hidden" name="id" value={organization.id} />
          <input type="hidden" name="subdomain" value={organization.subdomain || ""} />

          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Branding</h3>
            <div className="space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Organization Logo</label>
                <ImageUploader initialImageUrl={logoUrl} onUploadSuccess={(url) => setLogoUrl(url)} uploadPreset="organization_logos" />
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
                  className="w-full p-2 border border-slate-300 rounded-md shadow-sm text-slate-900 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your Organization Name"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Colors</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Primary Color */}
              <div>
                <label htmlFor="primary_color" className="block text-sm font-medium text-slate-700 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    id="primary_color"
                    name="primary_color"
                    type="color"
                    value={primaryColor || "#161659"}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer"
                    disabled={isSubmitting}
                  />
                  <input
                    type="text"
                    value={primaryColor || "#161659"}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 p-2 border border-slate-300 rounded-md text-sm"
                    placeholder="#161659"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label htmlFor="secondary_color" className="block text-sm font-medium text-slate-700 mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    id="secondary_color"
                    name="secondary_color"
                    type="color"
                    value={secondaryColor || "#BD1515"}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer"
                    disabled={isSubmitting}
                  />
                  <input
                    type="text"
                    value={secondaryColor || "#BD1515"}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 p-2 border border-slate-300 rounded-md text-sm"
                    placeholder="#BD1515"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Color Preview</h4>
            <div className="flex space-x-3">
              <div
                className="w-16 h-16 rounded-lg border-2 border-slate-200 flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: primaryColor || "#161659" }}
              >
                Primary
              </div>
              <div
                className="w-16 h-16 rounded-lg border-2 border-slate-200 flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: secondaryColor || "#BD1515" }}
              >
                Secondary
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full p-3 rounded-lg text-white font-bold bg-blue-600 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save & Publish Changes"}
            </button>
            <p className="text-xs text-slate-500 mt-2 text-center">Changes will be visible on your live website immediately</p>
          </div>
        </form>
      </div>

      {/* Right Panel: Live Preview */}
      <div className="lg:col-span-2">
        <div className="sticky top-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Live Preview</h3>
          <div className="w-full h-[80vh] bg-slate-100 rounded-lg overflow-hidden border shadow-inner">
            {organization.subdomain ? (
              <iframe
                ref={iframeRef}
                src={`/sites/${organization.subdomain}`}
                className="w-full h-full"
                title="Live Website Preview"
                onLoad={handleIframeLoad}
                // Prevent iframe from constantly reloading
                key={organization.subdomain} // Only recreate iframe if subdomain changes
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">No subdomain configured</p>
                  <p className="text-sm">Configure a subdomain to enable live preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
