// app/dashboard/players/components/player-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Player, PlayerFormData, PlayerFormSchema, Team } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import { ImageUploader } from "./image-uploader"; // Import our new component

interface PlayerFormProps {
  teams: Team[];
  playerToEdit?: Player | null;
  onSaveSuccess: (savedPlayer: Player, isNew: boolean) => void;
  onCancelEdit: () => void;
}

export function PlayerForm({
  teams,
  playerToEdit,
  onSaveSuccess,
  onCancelEdit,
}: PlayerFormProps) {
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<PlayerFormData>({
    resolver: zodResolver(PlayerFormSchema),
  });

  // Watch the headshot_url field so we can pass it to the uploader
  const headshotUrl = watch("headshot_url");

  useEffect(() => {
    if (playerToEdit) {
      //... (this logic stays the same)
      setValue("id", playerToEdit.id);
      setValue("first_name", playerToEdit.first_name);
      setValue("last_name", playerToEdit.last_name);
      setValue("jersey_number", playerToEdit.jersey_number);
      setValue("position", playerToEdit.position);
      setValue("team_id", playerToEdit.team_id);
      // Set the initial headshot URL
      setValue("headshot_url", playerToEdit.headshot_url);
    } else {
      reset({
        id: undefined,
        first_name: "",
        last_name: "",
        jersey_number: null,
        position: "",
        team_id: "",
        headshot_url: null,
      });
    }
  }, [playerToEdit, setValue, reset]);

  const onSubmit = async (data: PlayerFormData) => {
    try {
      // ... (The entire onSubmit logic for insert/update stays the same!)
      // The `headshot_url` is now part of the `data` object and will be saved automatically.
      let savedPlayer: Player | null = null;
      const isNew = !data.id;
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        jersey_number: data.jersey_number,
        position: data.position,
        team_id: data.team_id,
        headshot_url: data.headshot_url, // This field is now included
      };

      if (isNew) {
        const { data: newPlayer, error } = await supabase
          .from("players")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        savedPlayer = newPlayer;
      } else {
        const { data: updatedPlayer, error } = await supabase
          .from("players")
          .update(payload)
          .eq("id", data.id!)
          .select()
          .single();
        if (error) throw error;
        savedPlayer = updatedPlayer;
      }

      alert(`Player ${isNew ? "created" : "updated"} successfully!`);
      onSaveSuccess(savedPlayer, isNew);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Error saving player: ${error.message}`);
      } else {
        alert("An unknown error occurred while saving the player.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 p-4 border rounded-md bg-white shadow-sm"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {playerToEdit ? "Edit Player" : "Add New Player"}
        </h2>
        {playerToEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-sm text-gray-600 hover:underline"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Add the ImageUploader component here */}
      <ImageUploader
        initialImageUrl={headshotUrl || null}
        onUpload={(url) => {
          // When an image is uploaded, update the form's state
          setValue("headshot_url", url, { shouldValidate: true });
        }}
      />

      {/* ... (The rest of the form inputs are the same) ... */}
      <div>
        <label
          htmlFor="team_id"
          className="block text-sm font-medium text-gray-700"
        >
          Team
        </label>
        <select
          id="team_id"
          {...register("team_id")}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select a team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        {errors.team_id && (
          <p className="mt-1 text-red-500 text-sm">{errors.team_id.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="first_name"
          className="block text-sm font-medium text-gray-700"
        >
          First Name
        </label>
        <input
          id="first_name"
          {...register("first_name")}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.first_name && (
          <p className="mt-1 text-red-500 text-sm">
            {errors.first_name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="last_name"
          className="block text-sm font-medium text-gray-700"
        >
          Last Name
        </label>
        <input
          id="last_name"
          {...register("last_name")}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.last_name && (
          <p className="mt-1 text-red-500 text-sm">
            {errors.last_name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="jersey_number"
          className="block text-sm font-medium text-gray-700"
        >
          Jersey Number
        </label>
        <input
          id="jersey_number"
          type="number"
          {...register("jersey_number")}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.jersey_number && (
          <p className="mt-1 text-red-500 text-sm">
            {errors.jersey_number.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? "Saving..." : "Save Player"}
      </button>
    </form>
  );
}
