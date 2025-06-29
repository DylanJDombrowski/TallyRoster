// app/dashboard/players/components/player-form.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { createClient } from "@/lib/supabase/client";
import { Player, PlayerFormData, PlayerFormSchema, Team } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ImageUploader } from "./image-uploader";

interface PlayerFormProps {
  teams: Team[];
  playerToEdit?: Player | null;
  onSaveSuccess: (savedPlayer: Player, isNew: boolean) => void;
  onCancelEdit: () => void;
}

export function PlayerForm({ teams, playerToEdit, onSaveSuccess, onCancelEdit }: PlayerFormProps) {
  const supabase = createClient();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<PlayerFormData>({
    resolver: zodResolver(PlayerFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      jersey_number: undefined,
      position: "",
      team_id: "",
      headshot_url: null,
      height: "",
      bats: null,
      throws: null,
      town: "",
      school: "",
      grad_year: undefined,
      gpa: undefined,
      twitter_handle: "",
    },
  });

  const headshotUrl = watch("headshot_url");

  useEffect(() => {
    if (playerToEdit) {
      // 1. DATA MAPPING FIX: Manually map the data to match the form's enum schema
      const formData: PlayerFormData = {
        ...playerToEdit,
        bats: playerToEdit.bats as "L" | "R" | "S" | null, // Cast to the correct enum type
        throws: playerToEdit.throws as "L" | "R" | null, // Cast to the correct enum type
      };
      reset(formData);
    } else {
      reset();
    }
  }, [playerToEdit, reset]);

  const onSubmit: SubmitHandler<PlayerFormData> = async (data) => {
    try {
      let savedPlayer: Player | null = null;
      const isNew = !data.id;

      // The payload now includes all form fields
      const payload = { ...data };
      delete payload.id; // Remove id from payload for inserts/updates

      if (isNew) {
        const { data: newPlayer, error } = await supabase.from("players").insert(payload).select().single();
        if (error) throw error;
        savedPlayer = newPlayer;
      } else {
        const { data: updatedPlayer, error } = await supabase.from("players").update(payload).eq("id", data.id!).select().single();
        if (error) throw error;
        savedPlayer = updatedPlayer;
      }

      showToast(`Player ${isNew ? "created" : "updated"} successfully!`, "success");
      onSaveSuccess(savedPlayer, isNew);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      showToast(`Error saving player: ${errorMessage}`, "error");
      console.error("Error saving player:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) => {
        console.error("Form validation errors:", formErrors);
        showToast("Please fix the errors before submitting.", "error");
      })}
      // Increased vertical spacing from space-y-6 to space-y-8
      className="space-y-8 p-6 border rounded-lg bg-white shadow-sm"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-slate-900 font-bold">{playerToEdit ? "Edit Player" : "Add New Player"}</h2>
        {playerToEdit && (
          <button type="button" onClick={onCancelEdit} className="text-sm text-slate-600 hover:underline">
            Cancel
          </button>
        )}
      </div>

      <ImageUploader initialImageUrl={headshotUrl || null} onUpload={(url) => setValue("headshot_url", url, { shouldValidate: true })} />

      {/* --- Personal Info Section --- */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-700">Personal Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name">First Name</label>
            <input id="first_name" {...register("first_name")} />
            {errors.first_name && <p className="form-error">{errors.first_name.message}</p>}
          </div>
          <div>
            <label htmlFor="last_name">Last Name</label>
            <input id="last_name" {...register("last_name")} />
            {errors.last_name && <p className="form-error">{errors.last_name.message}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="town">Town</label>
          <input id="town" {...register("town")} />
          {errors.town && <p className="form-error">{errors.town.message}</p>}
        </div>
      </div>

      {/* --- Team Info Section --- */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-700">Team Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="team_id">Team</label>
            <select id="team_id" {...register("team_id")}>
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            {errors.team_id && <p className="form-error">{errors.team_id.message}</p>}
          </div>
          <div>
            <label htmlFor="jersey_number">Jersey Number</label>
            <input id="jersey_number" type="number" {...register("jersey_number")} />
            {errors.jersey_number && <p className="form-error">{errors.jersey_number.message}</p>}
          </div>
          <div>
            <label htmlFor="position">Position</label>
            <input id="position" {...register("position")} />
            {errors.position && <p className="form-error">{errors.position.message}</p>}
          </div>
        </div>
      </div>

      {/* --- Physical Attributes Section --- */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-700">Physical Attributes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="height">Height</label>
            <input id="height" {...register("height")} placeholder="e.g., 5' 8&quot;" />
            {errors.height && <p className="form-error">{errors.height.message}</p>}
          </div>
          <div>
            <label htmlFor="bats">Bats</label>
            <select id="bats" {...register("bats")}>
              <option value="">Select...</option>
              <option value="R">Right</option>
              <option value="L">Left</option>
              <option value="S">Switch</option>
            </select>
            {errors.bats && <p className="form-error">{errors.bats.message}</p>}
          </div>
          <div>
            <label htmlFor="throws">Throws</label>
            <select id="throws" {...register("throws")}>
              <option value="">Select...</option>
              <option value="R">Right</option>
              <option value="L">Left</option>
            </select>
            {errors.throws && <p className="form-error">{errors.throws.message}</p>}
          </div>
        </div>
      </div>

      {/* --- Academic Info Section --- */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-700">Academics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="school">School</label>
            <input id="school" {...register("school")} />
            {errors.school && <p className="form-error">{errors.school.message}</p>}
          </div>
          <div>
            <label htmlFor="grad_year">Graduation Year</label>
            <input id="grad_year" type="number" {...register("grad_year")} placeholder="e.g., 2025" />
            {errors.grad_year && <p className="form-error">{errors.grad_year.message}</p>}
          </div>
          <div>
            <label htmlFor="gpa">GPA</label>
            <input id="gpa" type="number" step="0.01" {...register("gpa")} placeholder="e.g., 3.8" />
            {errors.gpa && <p className="form-error">{errors.gpa.message}</p>}
          </div>
        </div>
      </div>

      {/* --- Social Info Section --- */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-700">Social Media</h3>
        <div>
          <label htmlFor="twitter_handle">Twitter Handle</label>
          <div className="flex items-center mt-1">
            <span className="inline-flex items-center px-3 text-slate-500 bg-slate-200 border border-r-0 border-slate-300 rounded-l-md">
              @
            </span>
            <input id="twitter_handle" {...register("twitter_handle")} className="rounded-l-none" />
          </div>
          {errors.twitter_handle && <p className="form-error">{errors.twitter_handle.message}</p>}
        </div>
      </div>

      {/* --- THIS IS THE SAVE BUTTON --- */}
      <div className="pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full p-3 rounded-lg text-white font-bold text-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
          }}
        >
          {isSubmitting ? "Saving..." : "Save Player"}
        </button>
      </div>
    </form>
  );
}
