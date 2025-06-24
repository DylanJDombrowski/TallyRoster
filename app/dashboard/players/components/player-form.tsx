// app/dashboard/players/components/player-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PlayerFormData, PlayerFormSchema, Team } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface PlayerFormProps {
  teams: Team[];
}

export function PlayerForm({ teams }: PlayerFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PlayerFormData>({
    resolver: zodResolver(PlayerFormSchema),
  });

  const onSubmit = async (data: PlayerFormData) => {
    try {
      const { error } = await supabase.from("players").insert({
        first_name: data.first_name,
        last_name: data.last_name,
        jersey_number: data.jersey_number,
        position: data.position,
        team_id: data.team_id,
      });

      if (error) throw error;

      alert("Player created successfully!");
      reset();
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert("Error creating player: " + error.message);
      } else {
        alert("Error creating player: " + String(error));
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 p-4 border rounded-md bg-white shadow-sm"
    >
      <h2 className="text-xl font-semibold">Add New Player</h2>

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
