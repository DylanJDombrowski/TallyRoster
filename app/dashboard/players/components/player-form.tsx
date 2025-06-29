// app/dashboard/players/components/player-form.tsx
"use client";

import { useToast } from "@/app/components/toast-provider"; // 1. IMPORT useToast
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
  const { showToast } = useToast(); // 2. INITIALIZE useToast

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<PlayerFormData>({
    resolver: zodResolver(PlayerFormSchema),
    // 3. SET defaultValues to prevent validation errors on load
    defaultValues: {
      id: undefined,
      first_name: "",
      last_name: "",
      jersey_number: undefined,
      position: "",
      team_id: "",
      headshot_url: null,
    },
  });

  const headshotUrl = watch("headshot_url");

  useEffect(() => {
    if (playerToEdit) {
      // Use reset to update all form values at once
      reset({
        id: playerToEdit.id,
        first_name: playerToEdit.first_name,
        last_name: playerToEdit.last_name,
        jersey_number: playerToEdit.jersey_number,
        position: playerToEdit.position,
        team_id: playerToEdit.team_id,
        headshot_url: playerToEdit.headshot_url,
      });
    } else {
      // Reset to default values for a new player
      reset();
    }
  }, [playerToEdit, reset]);

  // 4. THE CORRECTED ONSUBMIT HANDLER
  const onSubmit: SubmitHandler<PlayerFormData> = async (data) => {
    try {
      let savedPlayer: Player | null = null;
      const isNew = !data.id;
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        // Ensure jersey_number is a number or null
        jersey_number: data.jersey_number ? Number(data.jersey_number) : null,
        position: data.position,
        team_id: data.team_id,
        headshot_url: data.headshot_url,
      };

      if (isNew) {
        const { data: newPlayer, error } = await supabase.from("players").insert(payload).select().single();
        if (error) throw error;
        savedPlayer = newPlayer;
      } else {
        const { data: updatedPlayer, error } = await supabase.from("players").update(payload).eq("id", data.id!).select().single();
        if (error) throw error;
        savedPlayer = updatedPlayer;
      }

      // Use toast notifications instead of alerts
      showToast(`Player ${isNew ? "created" : "updated"} successfully!`, "success");
      onSaveSuccess(savedPlayer, isNew);
      if (isNew) {
        reset(); // Clear the form on successful creation
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      showToast(`Error saving player: ${errorMessage}`, "error");
      console.error("Error saving player:", error);
    }
  };

  return (
    // Pass a second function to handleSubmit to log validation errors
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) => {
        console.error("Form validation errors:", formErrors);
      })}
      className="space-y-4 p-4 border rounded-md bg-white shadow-sm"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl text-slate-800 font-semibold">{playerToEdit ? "Edit Player" : "Add New Player"}</h2>
        {playerToEdit && (
          <button type="button" onClick={onCancelEdit} className="text-sm text-slate-800 hover:underline">
            Cancel
          </button>
        )}
      </div>

      <ImageUploader
        initialImageUrl={headshotUrl || null}
        onUpload={(url) => {
          setValue("headshot_url", url, { shouldValidate: true });
        }}
      />

      <div>
        <label htmlFor="team_id" className="block text-sm font-medium text-slate-900">
          Team
        </label>
        <select id="team_id" {...register("team_id")} className="mt-1 block text-slate-800 w-full p-2 border border-gray-300 rounded-md">
          <option value="">Select a team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        {errors.team_id && <p className="mt-1 text-red-500 text-sm">{errors.team_id.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-slate-900">
            First Name
          </label>
          <input
            id="first_name"
            {...register("first_name")}
            className="mt-1 block text-slate-800 w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.first_name && <p className="mt-1 text-red-500 text-sm">{errors.first_name.message}</p>}
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-slate-900">
            Last Name
          </label>
          <input
            id="last_name"
            {...register("last_name")}
            className="mt-1 block w-full text-slate-800 p-2 border border-gray-300 rounded-md"
          />
          {errors.last_name && <p className="mt-1 text-red-500 text-sm">{errors.last_name.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="jersey_number" className="block text-sm font-medium text-slate-900">
            Jersey Number
          </label>
          <input
            id="jersey_number"
            type="number"
            {...register("jersey_number")}
            className="mt-1 block w-full p-2 border border-gray-300 text-slate-800 rounded-md"
          />
          {errors.jersey_number && <p className="mt-1 text-red-500 text-sm">{errors.jersey_number.message}</p>}
        </div>
        <div>
          <label htmlFor="position" className="block text-sm font-medium text-slate-900">
            Position
          </label>
          <input
            id="position"
            {...register("position")}
            className="mt-1 block w-full p-2 border border-gray-300 text-slate-800 rounded-md"
          />
          {errors.position && <p className="mt-1 text-red-500 text-sm">{errors.position.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full p-2 rounded-md text-white disabled:opacity-50"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-primary-foreground)",
        }}
      >
        {isSubmitting ? "Saving..." : "Save Player"}
      </button>
    </form>
  );
}
