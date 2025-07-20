// app/dashboard/admin/teams/components/team-form.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { createClient } from "@/lib/supabase/client";
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
      className="w-full text-white p-2 rounded-md disabled:bg-slate-800"
      style={{
        backgroundColor: "var(--color-primary)",
        color: "var(--color-primary-foreground)",
      }}
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

  // NEW: State for managing image upload
  const [imageUrl, setImageUrl] = useState<string | null>(teamToEdit?.team_image_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();
  // This useEffect handles the result of the form submission
  useEffect(() => {
    if (state?.success && state.team) {
      const isNew = !teamToEdit?.id;
      showToast(state.success, "success");
      onSaveSuccess(state.team, isNew);
      if (isNew) {
        formRef.current?.reset();
        setImageUrl(null); // Reset image on new form
      }
    }
    if (state?.error) {
      showToast(state.error, "error");
    }
  }, [state, onSaveSuccess, showToast, teamToEdit]);

  // This useEffect populates the form when a team is selected for editing
  useEffect(() => {
    setImageUrl(teamToEdit?.team_image_url || null);
  }, [teamToEdit]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("team-photos") // NOTE: Make sure you have a "team-photos" bucket in Supabase Storage
      .upload(fileName, file);

    if (error) {
      showToast(`Upload Error: ${error.message}`, "error");
      setIsUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("team-photos").getPublicUrl(data.path);
    setImageUrl(publicUrl);
    setIsUploading(false);
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

      {/* ADDED: Year Input */}
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

      {/* ADDED: Team Image URL Input */}
      <div>
        <label htmlFor="team_image_upload" className="block text-slate-800 text-sm font-medium">
          Team Image
        </label>

        {/* Preview the uploaded image */}
        {imageUrl && <Image src={imageUrl} alt="Team Preview" width={96} height={96} className="mt-2 w-24 h-24 object-cover rounded-md" />}

        {/* The file input itself */}
        <input
          id="team_image_upload"
          name="team_image_upload" // This name doesn't get sent to the server, it's for the label
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isUploading}
          className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {isUploading && <p className="text-sm text-slate-500 mt-1">Uploading...</p>}
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
