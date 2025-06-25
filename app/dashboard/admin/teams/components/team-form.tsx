// app/dashboard/admin/teams/components/team-form.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { Team } from "@/lib/types";
import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
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
      className="w-full text-white p-2 rounded-md disabled:bg-gray-400"
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
  const [state, formAction] = useFormState(upsertTeam, null);
  const formRef = useRef<HTMLFormElement>(null);
  const seasons = generateSeasonOptions();

  useEffect(() => {
    if (state?.success && state.team) {
      const isNew = !teamToEdit?.id;
      showToast(state.success, "success");
      onSaveSuccess(state.team, isNew);
      if (isNew) {
        formRef.current?.reset();
      }
    }
    if (state?.error) {
      showToast(state.error, "error");
    }
  }, [state, showToast, onSaveSuccess, teamToEdit]);

  useEffect(() => {
    if (teamToEdit) {
      const idInput = formRef.current?.querySelector<HTMLInputElement>('input[name="id"]');
      if (idInput) idInput.value = teamToEdit.id;
      const nameInput = formRef.current?.querySelector<HTMLInputElement>('input[name="name"]');
      if (nameInput) nameInput.value = teamToEdit.name;
      const seasonSelect = formRef.current?.querySelector<HTMLSelectElement>('select[name="season"]');
      if (seasonSelect) seasonSelect.value = teamToEdit.season || "";
      const primaryColorInput = formRef.current?.querySelector<HTMLInputElement>('input[name="primary_color"]');
      if (primaryColorInput) primaryColorInput.value = teamToEdit.primary_color || "#000000";
      const secondaryColorInput = formRef.current?.querySelector<HTMLInputElement>('input[name="secondary_color"]');
      if (secondaryColorInput) secondaryColorInput.value = teamToEdit.secondary_color || "#ffffff";
    } else {
      formRef.current?.reset();
    }
  }, [teamToEdit]);

  const handleCancel = () => {
    formRef.current?.reset();
    onCancelEdit();
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      key={teamToEdit?.id ?? "new"} // Add key to force re-render on edit change
      className="space-y-4 p-4 border rounded-md bg-white shadow-sm"
    >
      <input type="hidden" name="id" defaultValue={teamToEdit?.id ?? ""} />
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{teamToEdit ? "Edit Team" : "Add New Team"}</h2>
        {teamToEdit && (
          <button type="button" onClick={handleCancel} className="text-sm text-gray-600 hover:underline">
            Cancel
          </button>
        )}
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
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
        <label htmlFor="season" className="block text-sm font-medium">
          Season
        </label>
        <select
          id="season"
          name="season"
          defaultValue={teamToEdit?.season || ""}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select a season</option>
          {seasons.map((season) => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="primary_color" className="block text-sm font-medium">
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
          <label htmlFor="secondary_color" className="block text-sm font-medium">
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
