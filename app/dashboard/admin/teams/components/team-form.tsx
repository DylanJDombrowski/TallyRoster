// app/dashboard/admin/teams/components/team-form.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { Team } from "@/lib/types";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { upsertTeam } from "../actions";

interface TeamFormProps {
  teamToEdit?: Team | null;
  onSaveSuccess: (savedTeam: Team, isNew: boolean) => void;
  onCancelEdit: () => void;
  existingTeams: Team[]; // 🔧 NEW: Pass existing teams for validation
}

// Function to generate season options
const generateSeasonOptions = () => {
  const currentYear = new Date().getFullYear();
  const options = [];
  for (let i = 0; i < 4; i++) {
    const startYear = currentYear + i;
    const endYear = (startYear + 1).toString().slice(-2);
    options.push(`${startYear}-${endYear}`);
  }
  return options;
};

export function TeamForm({ teamToEdit, onSaveSuccess, onCancelEdit, existingTeams }: TeamFormProps) {
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const seasons = generateSeasonOptions();

  // Form state
  const [imageUrl, setImageUrl] = useState<string | null>(teamToEdit?.team_image_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Populate form when editing
  useEffect(() => {
    setImageUrl(teamToEdit?.team_image_url || null);
    setValidationErrors({}); // Clear errors when switching teams
  }, [teamToEdit]);

  // 🔧 FIX: Custom form submission handler (no useActionState)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return; // Prevent double submission

    const formData = new FormData(event.currentTarget);
    const errors: { [key: string]: string } = {};

    // 🔧 FIX: Client-side validation
    const teamName = (formData.get("name") as string)?.trim();
    const season = formData.get("season") as string;

    if (!teamName) {
      errors.name = "Team name is required";
    }

    if (!season) {
      errors.season = "Season is required";
    }

    // 🔧 FIX: Check for duplicate team name in same season
    if (teamName && season) {
      const duplicate = existingTeams.find(
        (team) => team.name.toLowerCase() === teamName.toLowerCase() && team.season === season && team.id !== teamToEdit?.id // Allow editing same team
      );

      if (duplicate) {
        errors.name = `A team named "${teamName}" already exists for the ${season} season`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToast("Please fix the errors below", "error");
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);

    try {
      // 🔧 FIX: Call server action directly
      const result = await upsertTeam(null, formData);

      if (result.error) {
        showToast(result.error, "error");
        if (result.fields) {
          // Convert string[] to string for each field
          const flatFields: { [key: string]: string } = {};
          Object.entries(result.fields).forEach(([key, value]) => {
            flatFields[key] = Array.isArray(value) ? value.join(", ") : value ?? "";
          });
          setValidationErrors(flatFields);
        }
      } else if (result.success && result.team) {
        const isNew = !teamToEdit?.id;
        showToast(result.success, "success");
        onSaveSuccess(result.team, isNew);

        if (isNew) {
          formRef.current?.reset();
          setImageUrl(null);
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("File size must be under 10MB", "error");
      return;
    }

    setIsUploading(true);

    try {
      const timestamp = Math.round(new Date().getTime() / 1000);

      const paramsToSign = {
        timestamp: timestamp.toString(),
        upload_preset: "team_photos",
        folder: "teams",
      };

      const signResponse = await fetch("/api/sign-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paramsToSign }),
      });

      if (!signResponse.ok) {
        const errorData = await signResponse.json();
        throw new Error(errorData.error || "Failed to get upload signature");
      }

      const { signature } = await signResponse.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("upload_preset", "team_photos");
      formData.append("folder", "teams");

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const uploadData = await uploadResponse.json();

      if (uploadData.secure_url) {
        setImageUrl(uploadData.secure_url);
        showToast("Team image uploaded successfully!", "success");
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (error) {
      console.error("💥 Team upload error:", error);
      showToast(error instanceof Error ? error.message : "Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    formRef.current?.reset();
    setValidationErrors({});
    setImageUrl(teamToEdit?.team_image_url || null);
    onCancelEdit();
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      key={teamToEdit?.id ?? "new"}
      className="space-y-4 p-4 border rounded-md bg-white shadow-sm"
    >
      <input type="hidden" name="id" defaultValue={teamToEdit?.id ?? ""} />
      <input type="hidden" name="team_image_url" value={imageUrl || ""} />

      <div className="flex justify-between items-center">
        <h2 className="text-xl text-slate-900 font-semibold">{teamToEdit ? "Edit Team" : "Add New Team"}</h2>
        {teamToEdit && (
          <button type="button" onClick={handleCancel} className="text-sm text-slate-800 hover:underline">
            Cancel
          </button>
        )}
      </div>

      {/* Team Name */}
      <div>
        <label htmlFor="name" className="block text-slate-800 text-sm font-medium">
          Team Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          defaultValue={teamToEdit?.name}
          className={`mt-1 block w-full p-2 border text-slate-800 rounded-md ${
            validationErrors.name ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
          required
        />
        {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
      </div>

      {/* Season */}
      <div>
        <label htmlFor="season" className="block text-slate-800 text-sm font-medium">
          Season <span className="text-red-500">*</span>
        </label>
        <select
          id="season"
          name="season"
          defaultValue={teamToEdit?.season || ""}
          className={`mt-1 block w-full p-2 border text-slate-800 rounded-md ${
            validationErrors.season ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
          required
        >
          <option value="">Select a season</option>
          {seasons.map((season) => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
        </select>
        {validationErrors.season && <p className="mt-1 text-sm text-red-600">{validationErrors.season}</p>}
      </div>

      {/* Year Input */}
      <div>
        <label htmlFor="year" className="block text-slate-800 text-sm font-medium">
          Year (e.g., 2025)
        </label>
        <input
          id="year"
          name="year"
          type="number"
          defaultValue={teamToEdit?.year ?? new Date().getFullYear()}
          className="mt-1 block w-full p-2 border text-slate-800 border-gray-300 rounded-md"
        />
      </div>

      {/* Team Image Upload */}
      <div>
        <label htmlFor="team_image_upload" className="block text-slate-800 text-sm font-medium">
          Team Image
        </label>

        {imageUrl && <Image src={imageUrl} alt="Team Preview" width={96} height={96} className="mt-2 w-24 h-24 object-cover rounded-md" />}

        <input
          id="team_image_upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isUploading}
          className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {isUploading && <p className="text-sm text-slate-500 mt-1">Uploading...</p>}
        <p className="text-xs text-slate-500 mt-1">PNG, JPG, or GIF up to 10MB</p>
      </div>

      {/* Color Pickers */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="primary_color" className="block text-slate-800 text-sm font-medium">
            Primary Color
          </label>
          <input
            id="primary_color"
            name="primary_color"
            type="color"
            defaultValue={teamToEdit?.primary_color || "#161659"}
            className="mt-1 block w-full h-10 p-1 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="secondary_color" className="block text-slate-800 text-sm font-medium">
            Secondary Color
          </label>
          <input
            id="secondary_color"
            name="secondary_color"
            type="color"
            defaultValue={teamToEdit?.secondary_color || "#BD1515"}
            className="mt-1 block w-full h-10 p-1 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isUploading}
        className="w-full p-2 rounded-md font-semibold text-white bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400"
      >
        {isSubmitting ? "Saving..." : "Save Team"}
      </button>
    </form>
  );
}
