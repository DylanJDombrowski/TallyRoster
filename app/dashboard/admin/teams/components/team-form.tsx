// app/dashboard/admin/teams/components/team-form.tsx
"use client";

import { Team } from "@/lib/types";
import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { upsertTeam } from "../actions";

interface TeamFormProps {
  teamToEdit?: Team | null;
  onSaveSuccess: (savedTeam: Team, isNew: boolean) => void;
  onCancelEdit: () => void;
}

export function TeamForm({ teamToEdit, onSaveSuccess, onCancelEdit }: TeamFormProps) {
  const [state, formAction] = useFormState(upsertTeam, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success && state.team) {
      const isNew = !teamToEdit;
      alert(state.success);
      onSaveSuccess(state.team, isNew);
      formRef.current?.reset();
    }
    if (state?.error) {
      alert(state.error);
    }
  }, [state, onSaveSuccess, teamToEdit]);

  useEffect(() => {
    if (teamToEdit) {
      formRef.current?.querySelector<HTMLInputElement>('input[name="id"]')?.setAttribute("value", teamToEdit.id);
      formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.setAttribute("value", teamToEdit.name);
      formRef.current?.querySelector<HTMLInputElement>('input[name="season"]')?.setAttribute("value", teamToEdit.season || "");
    } else {
      formRef.current?.reset();
    }
  }, [teamToEdit]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 p-4 border rounded-md bg-white shadow-sm">
      <input type="hidden" name="id" defaultValue={teamToEdit?.id} />
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{teamToEdit ? "Edit Team" : "Add New Team"}</h2>
        {teamToEdit && (
          <button
            type="button"
            onClick={() => {
              onCancelEdit();
              formRef.current?.reset();
            }}
            className="text-sm text-gray-600 hover:underline"
          >
            Cancel
          </button>
        )}
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Team Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={teamToEdit?.name}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label htmlFor="season" className="block text-sm font-medium text-gray-700">
          Season
        </label>
        <input
          id="season"
          name="season"
          defaultValue={teamToEdit?.season || ""}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
        Save Team
      </button>
    </form>
  );
}
