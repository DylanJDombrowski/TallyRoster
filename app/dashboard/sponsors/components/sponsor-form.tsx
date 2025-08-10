"use client";

import { useState } from "react";
import { ImageUploader } from "../../players/components/image-uploader";
import { createSponsor, updateSponsor } from "@/lib/actions";
import { ArrowLeft } from "lucide-react";

interface Sponsor {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  position: number | null;
  active: boolean | null;
  organization_id: string;
  created_at?: string;
}

interface SponsorFormProps {
  sponsorToEdit: Sponsor | null;
  onSaveSuccess: (sponsor: Sponsor, isNew: boolean) => void;
  onCancel: () => void;
  organizationId: string;
}

export function SponsorForm({
  sponsorToEdit,
  onSaveSuccess,
  onCancel,
  organizationId,
}: SponsorFormProps) {
  const [name, setName] = useState(sponsorToEdit?.name || "");
  const [description, setDescription] = useState(
    sponsorToEdit?.description || ""
  );
  const [websiteUrl, setWebsiteUrl] = useState(
    sponsorToEdit?.website_url || ""
  );
  const [logoUrl, setLogoUrl] = useState(sponsorToEdit?.logo_url || "");
  const [isActive, setIsActive] = useState(sponsorToEdit?.active ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Sponsor name is required";
    }

    if (websiteUrl && !websiteUrl.match(/^https?:\/\/.+/)) {
      newErrors.website_url =
        "Please enter a valid URL starting with http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("website_url", websiteUrl);
    formData.append("logo_url", logoUrl);
    formData.append("active", isActive.toString());
    formData.append("organization_id", organizationId);

    if (sponsorToEdit) {
      formData.append("id", sponsorToEdit.id);
    }

    try {
      const result = sponsorToEdit
        ? await updateSponsor(formData)
        : await createSponsor(formData);

      if (result.success && result.data) {
        onSaveSuccess(result.data, !sponsorToEdit);
      } else {
        setErrors({ submit: result.message || "Failed to save sponsor" });
      }
    } catch {
      setErrors({ submit: "An unexpected error occurred" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onCancel}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to sponsors
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {sponsorToEdit ? "Edit Sponsor" : "Add New Sponsor"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sponsor Logo
            </label>
            <ImageUploader
              initialImageUrl={logoUrl}
              onUploadSuccess={setLogoUrl}
              uploadPreset="sponsor_logos"
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sponsor Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Acme Corporation"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="website_url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Website URL
            </label>
            <input
              id="website_url"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com"
            />
            {errors.website_url && (
              <p className="mt-1 text-sm text-red-600">{errors.website_url}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the sponsor and partnership..."
            />
          </div>

          <div className="flex items-center">
            <input
              id="active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700">
              Display this sponsor on the public website
            </label>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving
                ? "Saving..."
                : sponsorToEdit
                ? "Update Sponsor"
                : "Add Sponsor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
