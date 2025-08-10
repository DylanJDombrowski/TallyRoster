// app/dashboard/admin/teams/components/team-form.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { Team } from "@/lib/types";
import { upsertTeam } from "@/lib/actions/teams";
import { User, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface TeamFormProps {
  teamToEdit?: Team | null;
  onSaveSuccess: (savedTeam: Team, isNew: boolean) => void;
  onCancelEdit: () => void;
  existingTeams: Team[];
  // NEW: Coach data for editing
  initialCoachData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
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

export function TeamForm({
  teamToEdit,
  onSaveSuccess,
  onCancelEdit,
  existingTeams,
  initialCoachData,
}: TeamFormProps) {
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const seasons = generateSeasonOptions();

  // Form state
  const [imageUrl, setImageUrl] = useState<string | null>(
    teamToEdit?.team_image_url || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // NEW: Coach form state
  const [coachData, setCoachData] = useState({
    name: initialCoachData?.name || "",
    email: initialCoachData?.email || "",
    phone: initialCoachData?.phone || "",
  });

  // Populate form when editing
  useEffect(() => {
    setImageUrl(teamToEdit?.team_image_url || null);
    setValidationErrors({});

    // NEW: Reset coach data when team changes
    setCoachData({
      name: initialCoachData?.name || "",
      email: initialCoachData?.email || "",
      phone: initialCoachData?.phone || "",
    });
  }, [teamToEdit, initialCoachData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const errors: { [key: string]: string } = {};

    // Basic validation
    const teamName = (formData.get("name") as string)?.trim();
    const season = formData.get("season") as string;
    const coachName = (formData.get("coach_name") as string)?.trim();
    const coachEmail = (formData.get("coach_email") as string)?.trim();

    if (!teamName) {
      errors.name = "Team name is required";
    }

    if (!season) {
      errors.season = "Season is required";
    }

    // NEW: Coach validation
    if (coachName && coachName.length < 2) {
      errors.coach_name = "Coach name must be at least 2 characters";
    }

    if (coachEmail && !coachEmail.includes("@")) {
      errors.coach_email = "Please enter a valid email address";
    }

    // Check for duplicate team name in same season
    if (teamName && season) {
      const duplicate = existingTeams.find(
        (team) =>
          team.name.toLowerCase() === teamName.toLowerCase() &&
          team.season === season &&
          team.id !== teamToEdit?.id
      );

      if (duplicate) {
        errors.name = `A team named "${teamName}" already exists for the ${season} season`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToast("Please fix the errors below", "error");
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);

    try {
      const result = await upsertTeam(null, formData);

      if (result.error) {
        showToast(result.error, "error");
        if (result.fields) {
          const flatFields: { [key: string]: string } = {};
          Object.entries(result.fields).forEach(([key, value]) => {
            flatFields[key] = Array.isArray(value)
              ? value.join(", ")
              : value ?? "";
          });
          setValidationErrors(flatFields);
        }
      } else if (result.success && result.team) {
        const isNew = !teamToEdit?.id;
        showToast(result.success, "success");
        onSaveSuccess(result.team, isNew);

        if (isNew) {
          formRef.current?.reset();
          setImageUrl(null);
          setCoachData({ name: "", email: "", phone: "" });
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("File size must be under 10MB", "error");
      return;
    }

    setIsUploading(true);

    try {
      const timestamp = Math.round(new Date().getTime() / 1000);

      const paramsToSign = {
        timestamp: timestamp.toString(),
        upload_preset: "team_photos",
        folder: "teams",
      };

      const signResponse = await fetch("/api/sign-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paramsToSign }),
      });

      if (!signResponse.ok) {
        const errorData = await signResponse.json();
        throw new Error(errorData.error || "Failed to get upload signature");
      }

      const { signature } = await signResponse.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("upload_preset", "team_photos");
      formData.append("folder", "teams");

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const uploadData = await uploadResponse.json();

      if (uploadData.secure_url) {
        setImageUrl(uploadData.secure_url);
        showToast("Team image uploaded successfully!", "success");
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (error) {
      console.error("Team upload error:", error);
      showToast(
        error instanceof Error ? error.message : "Upload failed",
        "error"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    formRef.current?.reset();
    setValidationErrors({});
    setImageUrl(teamToEdit?.team_image_url || null);
    setCoachData({
      name: initialCoachData?.name || "",
      email: initialCoachData?.email || "",
      phone: initialCoachData?.phone || "",
    });
    onCancelEdit();
  };

  // NEW: Handle coach field changes
  const handleCoachFieldChange = (
    field: keyof typeof coachData,
    value: string
  ) => {
    setCoachData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      key={teamToEdit?.id ?? "new"}
      className="space-y-6 p-6 border rounded-lg bg-white shadow-sm"
    >
      <input type="hidden" name="id" defaultValue={teamToEdit?.id ?? ""} />
      <input type="hidden" name="team_image_url" value={imageUrl || ""} />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl text-slate-900 font-semibold">
          {teamToEdit ? "Edit Team" : "Add New Team"}
        </h2>
        {teamToEdit && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm text-slate-600 hover:text-slate-800 hover:underline"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Team Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-2">
          Team Information
        </h3>

        {/* Team Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-slate-700 text-sm font-medium mb-2"
          >
            Team Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            defaultValue={teamToEdit?.name}
            className={`w-full p-3 border text-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.name
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="e.g., Vipers, Eagles, Thunder"
            required
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>

        {/* Season and Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="season"
              className="block text-slate-700 text-sm font-medium mb-2"
            >
              Season <span className="text-red-500">*</span>
            </label>
            <select
              id="season"
              name="season"
              defaultValue={teamToEdit?.season || ""}
              className={`w-full p-3 border text-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.season
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              required
            >
              <option value="">Select a season</option>
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
            {validationErrors.season && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.season}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="year"
              className="block text-slate-700 text-sm font-medium mb-2"
            >
              Year
            </label>
            <input
              id="year"
              name="year"
              type="number"
              defaultValue={teamToEdit?.year ?? new Date().getFullYear()}
              className="w-full p-3 border text-slate-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="2025"
            />
          </div>
        </div>

        {/* Team Image Upload */}
        <div>
          <label
            htmlFor="team_image_upload"
            className="block text-slate-700 text-sm font-medium mb-2"
          >
            Team Logo/Image
          </label>

          {imageUrl && (
            <div className="mb-3">
              <Image
                src={imageUrl}
                alt="Team Preview"
                width={96}
                height={96}
                className="w-24 h-24 object-cover rounded-lg border-2 border-slate-200"
              />
            </div>
          )}

          <input
            id="team_image_upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          {isUploading && (
            <p className="text-sm text-blue-600 mt-1">Uploading...</p>
          )}
          <p className="text-xs text-slate-500 mt-1">
            PNG, JPG, or GIF up to 10MB
          </p>
        </div>

        {/* Color Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="primary_color"
              className="block text-slate-700 text-sm font-medium mb-2"
            >
              Primary Color
            </label>
            <input
              id="primary_color"
              name="primary_color"
              type="color"
              defaultValue={teamToEdit?.primary_color || "#161659"}
              className="w-full h-12 p-1 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label
              htmlFor="secondary_color"
              className="block text-slate-700 text-sm font-medium mb-2"
            >
              Secondary Color
            </label>
            <input
              id="secondary_color"
              name="secondary_color"
              type="color"
              defaultValue={teamToEdit?.secondary_color || "#BD1515"}
              className="w-full h-12 p-1 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* NEW: Coach Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-2 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Coach Information
        </h3>
        <p className="text-sm text-slate-600">
          Assign a coach to this team. The coach will receive team
          communications and can manage players.
        </p>

        {/* Coach Name */}
        <div>
          <label
            htmlFor="coach_name"
            className="block text-slate-700 text-sm font-medium mb-2"
          >
            Coach Name
          </label>
          <input
            id="coach_name"
            name="coach_name"
            value={coachData.name}
            onChange={(e) => handleCoachFieldChange("name", e.target.value)}
            className={`w-full p-3 border text-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.coach_name
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="e.g., Sarah Johnson"
          />
          {validationErrors.coach_name && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.coach_name}
            </p>
          )}
        </div>

        {/* Coach Email and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="coach_email"
              className="block text-slate-700 text-sm font-medium mb-2"
            >
              <Mail className="w-4 h-4 inline mr-1" />
              Coach Email
            </label>
            <input
              id="coach_email"
              name="coach_email"
              type="email"
              value={coachData.email}
              onChange={(e) => handleCoachFieldChange("email", e.target.value)}
              className={`w-full p-3 border text-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.coach_email
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="coach@example.com"
            />
            {validationErrors.coach_email && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.coach_email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="coach_phone"
              className="block text-slate-700 text-sm font-medium mb-2"
            >
              <Phone className="w-4 h-4 inline mr-1" />
              Coach Phone
            </label>
            <input
              id="coach_phone"
              name="coach_phone"
              type="tel"
              value={coachData.phone}
              onChange={(e) => handleCoachFieldChange("phone", e.target.value)}
              className="w-full p-3 border text-slate-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> The coach&apos;s email address will be
            included in team communications. You can update coach information
            anytime by editing the team.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Saving...
            </>
          ) : (
            <>{teamToEdit ? "Update Team & Coach" : "Create Team & Coach"}</>
          )}
        </button>
      </div>
    </form>
  );
}
