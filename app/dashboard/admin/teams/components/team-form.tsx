// app/dashboard/admin/teams/components/team-form.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { Team } from "@/lib/types";
import { useActionState, useEffect, useRef } from "react";
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
  // 2. Use useActionState here. The initial state is the third argument.
  const [state, formAction] = useActionState(upsertTeam, null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.success, state?.error]);

  useEffect(() => {
    // This effect now correctly populates all form fields when editing
    if (teamToEdit) {
      const idInput = formRef.current?.querySelector<HTMLInputElement>('input[name="id"]');
      if (idInput) idInput.value = teamToEdit.id;

      const nameInput = formRef.current?.querySelector<HTMLInputElement>('input[name="name"]');
      if (nameInput) nameInput.value = teamToEdit.name;

      const seasonSelect = formRef.current?.querySelector<HTMLSelectElement>('select[name="season"]');
      if (seasonSelect) seasonSelect.value = teamToEdit.season || "";

      // FIXED: Populate the new 'year' and 'team_image_url' fields
      const yearInput = formRef.current?.querySelector<HTMLInputElement>('input[name="year"]');
      if (yearInput) yearInput.value = String(teamToEdit.year || new Date().getFullYear());

      const imageUrlInput = formRef.current?.querySelector<HTMLInputElement>('input[name="team_image_url"]');
      if (imageUrlInput) imageUrlInput.value = teamToEdit.team_image_url || "";

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
    <form ref={formRef} action={formAction} key={teamToEdit?.id ?? "new"} className="space-y-4 p-4 border rounded-md bg-white shadow-sm">
      <input type="hidden" name="id" defaultValue={teamToEdit?.id ?? ""} />
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
        <label htmlFor="team_image_url" className="block text-slate-800 text-sm font-medium">
          Team Image URL (Optional)
        </label>
        <input
          id="team_image_url"
          name="team_image_url"
          type="url"
          defaultValue={teamToEdit?.team_image_url || ""}
          className="mt-1 block w-full p-2 border text-slate-800 border-gray-300 rounded-md"
          placeholder="https://example.com/image.png"
        />
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
