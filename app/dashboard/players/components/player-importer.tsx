// app/dashboard/players/components/player-importer.tsx
"use client";

import { useState } from "react";
import { useToast } from "@/app/components/toast-provider";
import { Team } from "@/lib/types";

interface PlayerImporterProps {
  teams: Team[];
  organizationId: string; // We need the org ID to pass to the API
  onImportSuccess: () => void; // A function to refetch players after import
}

export function PlayerImporter({
  teams,
  organizationId,
  onImportSuccess,
}: PlayerImporterProps) {
  const { showToast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleImport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !selectedTeam) {
      showToast("Please select a team and a CSV file.", "error");
      return;
    }

    setIsImporting(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("team_id", selectedTeam);
    formData.append("organization_id", organizationId);

    try {
      const response = await fetch("/api/import/players", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to import players.");
      }

      showToast(result.message, "success");
      onImportSuccess(); // Trigger a data refresh on the parent page
      // Reset form
      setSelectedFile(null);
      setSelectedTeam("");
      (document.getElementById("file-upload") as HTMLInputElement).value = "";
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      showToast(`Import failed: ${errorMessage}`, "error");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "first_name,last_name,jersey_number,position,grad_year\n" +
      "John,Doe,23,Pitcher,2025\n" +
      "Jane,Smith,15,Catcher,2026\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "player_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">
        Import Players from CSV
      </h3>
      <div className="mb-4 text-sm text-slate-600">
        <p>Import multiple players at once by uploading a CSV file.</p>
        <p>
          The file must contain the following headers: `first_name`,
          `last_name`, `jersey_number`, `position`, `grad_year`.
        </p>
        <button
          onClick={downloadTemplate}
          className="text-blue-600 hover:underline font-semibold mt-1"
        >
          Download Template
        </button>
      </div>
      <form onSubmit={handleImport} className="space-y-4">
        <div>
          <label htmlFor="team-select">Select Team for Import</label>
          <select
            id="team-select"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            required
          >
            <option value="" disabled>
              -- Choose a team --
            </option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="file-upload">CSV File</label>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isImporting || !selectedFile || !selectedTeam}
          className="w-full p-3 rounded-lg text-white font-bold bg-blue-600 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isImporting ? "Importing..." : "Import Players"}
        </button>
      </form>
    </div>
  );
}
