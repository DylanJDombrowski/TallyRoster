// app/dashboard/players/components/csv-import-modal.tsx
"use client";

import { Team } from "@/lib/types";
import { useState } from "react";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  organizationId: string;
  onImportSuccess: () => void;
}

export function CSVImportModal({
  isOpen,
  onClose,
  teams,
  organizationId,
  onImportSuccess,
}: CSVImportModalProps) {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "first_name,last_name,jersey_number,position,grad_year,height,town,school\n" +
      "John,Doe,23,Pitcher,2025,6'2\",Louisville,Central High\n" +
      "Jane,Smith,15,Catcher,2026,5'6\",Lexington,North High\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "player_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (!selectedFile || !selectedTeam) return;

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

      onImportSuccess();
      onClose();
      setSelectedFile(null);
      setSelectedTeam("");
    } catch (error) {
      console.error("Import failed:", error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Import Players</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Team
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const files = e.target.files;
                  setSelectedFile(files && files.length > 0 ? files[0] : null);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                Need a template? Download our CSV template with sample data.
              </p>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Download Template →
              </button>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedFile || !selectedTeam || isImporting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isImporting ? "Importing..." : "Import Players"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
