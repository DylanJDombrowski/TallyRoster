// app/dashboard/admin/teams/components/team-form.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { Team } from "@/lib/types";
import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { upsertTeam } from "../actions";

interface TeamFormProps {
  teamToEdit?: Team | null;
  onSaveSuccess: (savedTeam: Team, isNew: boolean) => void;
  onCancelEdit: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full p-2 rounded-md font-semibold text-white bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400"
    >
      {pending ? "Saving..." : "Save Team"}
    </button>
  );
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

export function TeamForm({ teamToEdit, onSaveSuccess, onCancelEdit }: TeamFormProps) {
  const { showToast } = useToast();
  const [state, formAction] = useActionState(upsertTeam, null);
  const formRef = useRef<HTMLFormElement>(null);
  const seasons = generateSeasonOptions();

  // 🔧 FIX: State for managing Cloudinary image upload (like players)
  const [imageUrl, setImageUrl] = useState<string | null>(teamToEdit?.team_image_url || null);
  const [isUploading, setIsUploading] = useState(false);

  // 🔧 FIX: Track if we've already processed this success to prevent loops
  const [processedStateId, setProcessedStateId] = useState<string | null>(null);

  // This useEffect handles the result of the form submission
  useEffect(() => {
    // Create a unique ID for this state to prevent processing the same success multiple times
    const stateId = state?.success && state?.team ? `${state.team.id}-${state.success}` : null;

    if (state?.success && state.team && stateId && stateId !== processedStateId) {
      const isNew = !teamToEdit?.id;
      showToast(state.success, "success");
      onSaveSuccess(state.team, isNew);
      setProcessedStateId(stateId); // Mark this state as processed

      if (isNew) {
        formRef.current?.reset();
        setImageUrl(null);
      }
    }
    if (state?.error) {
      showToast(state.error, "error");
    }
  }, [state, teamToEdit?.id, showToast, onSaveSuccess, processedStateId]);

  // Reset processed state when editing a different team
  useEffect(() => {
    setProcessedStateId(null);
  }, [teamToEdit?.id]);

  // This useEffect populates the form when a team is selected for editing
  useEffect(() => {
    setImageUrl(teamToEdit?.team_image_url || null);
  }, [teamToEdit]);

  // 🔧 FIX: Cloudinary upload matching your player pattern
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("🖼️ Starting team image upload:", {
      fileName: file.name,
      fileSize: file.size,
    });

    // Validate file
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      showToast("File size must be under 10MB", "error");
      return;
    }

    setIsUploading(true);

    try {
      const timestamp = Math.round(new Date().getTime() / 1000);

      // 🔧 FIX: Use team-specific upload preset and folder
      const paramsToSign = {
        timestamp: timestamp.toString(),
        upload_preset: "team_photos", // 🔧 You'll need to create this preset
        folder: "teams", // 🔧 Organize team images in teams folder
      };

      console.log("🔐 Getting signature for team upload:", paramsToSign);

      // Get signature from your API
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
      console.log("✅ Signature received for team");

      // Prepare form data for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("upload_preset", "team_photos");
      formData.append("folder", "teams");

      console.log("☁️ Uploading team image to Cloudinary...");

      // Upload to Cloudinary
      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error("❌ Cloudinary upload failed:", errorData);
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const uploadData = await uploadResponse.json();
      console.log("✅ Team upload successful:", uploadData);

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
    onCancelEdit();
  };

  return (
    <form ref={formRef} action={formAction} key={teamToEdit?.id ?? "new"} className="space-y-4 p-4 border rounded-md bg-white shadow-sm">
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
          Team Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={teamToEdit?.name}
          className="mt-1 block w-full p-2 border text-slate-800 border-gray-300 rounded-md"
          required
        />
      </div>

      {/* Season */}
      <div>
        <label htmlFor="season" className="block text-slate-800 text-sm font-medium">
          Season
        </label>
        <select
          id="season"
          name="season"
          defaultValue={teamToEdit?.season || ""}
          className="mt-1 block w-full p-2 border text-slate-800 border-gray-300 rounded-md"
        >
          <option value="">Select a season</option>
          {seasons.map((season) => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
        </select>
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

      {/* 🔧 FIX: Team Image Upload (Cloudinary style) */}
      <div>
        <label htmlFor="team_image_upload" className="block text-slate-800 text-sm font-medium">
          Team Image
        </label>

        {/* Preview the uploaded image */}
        {imageUrl && <Image src={imageUrl} alt="Team Preview" width={96} height={96} className="mt-2 w-24 h-24 object-cover rounded-md" />}

        {/* The file input */}
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

      <SubmitButton />
    </form>
  );
}
