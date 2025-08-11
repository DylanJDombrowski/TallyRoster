// app/dashboard/admin/teams/components/team-form.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Phone, Upload, X } from "lucide-react";
import Image from "next/image";

import { useToast } from "@/app/components/toast-provider";
import { useCloudinaryUpload } from "@/lib/hooks/use-cloudinary-upload";
import {
  Team,
  TeamFormSchema,
  TeamFormData,
  generateSeasonOptions,
} from "@/lib/types";
import { upsertTeam } from "@/lib/actions";

interface TeamFormProps {
  teamToEdit?: Team | null;
  onSaveSuccess: (savedTeam: Team, isNew: boolean) => void;
  onCancelEdit: () => void;
  existingTeams: Team[];
  initialCoachData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export function TeamForm({
  teamToEdit,
  onSaveSuccess,
  onCancelEdit,
  existingTeams,
  initialCoachData,
}: TeamFormProps) {
  const { showToast } = useToast();
  const seasons = generateSeasonOptions();

  // React Hook Form setup - FIXED typing
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<TeamFormData>({
    resolver: zodResolver(TeamFormSchema),
    defaultValues: {
      name: "",
      season: "",
      year: new Date().getFullYear(),
      team_image_url: "",
      primary_color: "#161659",
      secondary_color: "#BD1515",
      coach_name: "",
      coach_email: "",
      coach_phone: "",
    },
  });

  // Watch the team image URL for preview
  const teamImageUrl = watch("team_image_url");

  // Cloudinary upload hook
  const {
    isUploading,
    error: uploadError,
    uploadImage,
    clearError: clearUploadError,
  } = useCloudinaryUpload({
    uploadPreset: "team_photos",
    folder: "teams",
    onSuccess: (url) => {
      setValue("team_image_url", url);
      showToast("Team image uploaded successfully!", "success");
    },
    onError: (error) => {
      showToast(error, "error");
    },
  });

  // Reset form when teamToEdit or initialCoachData changes
  useEffect(() => {
    if (teamToEdit) {
      reset({
        id: teamToEdit.id,
        name: teamToEdit.name,
        season: teamToEdit.season || "",
        year: teamToEdit.year ?? new Date().getFullYear(),
        team_image_url: teamToEdit.team_image_url || "",
        primary_color: teamToEdit.primary_color || "#161659",
        secondary_color: teamToEdit.secondary_color || "#BD1515",
        coach_name: initialCoachData?.name || "",
        coach_email: initialCoachData?.email || "",
        coach_phone: initialCoachData?.phone || "",
      });
    } else {
      reset({
        name: "",
        season: "",
        year: new Date().getFullYear(),
        team_image_url: "",
        primary_color: "#161659",
        secondary_color: "#BD1515",
        coach_name: initialCoachData?.name || "",
        coach_email: initialCoachData?.email || "",
        coach_phone: initialCoachData?.phone || "",
      });
    }
    clearErrors();
    clearUploadError();
  }, [teamToEdit, initialCoachData, reset, clearErrors, clearUploadError]);

  // Handle image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };

  // Form submission
  const onSubmit = async (data: TeamFormData) => {
    // Check for duplicate team name in same season
    const duplicate = existingTeams.find(
      (team) =>
        team.name.toLowerCase() === data.name.toLowerCase() &&
        team.season === data.season &&
        team.id !== teamToEdit?.id
    );

    if (duplicate) {
      setError("name", {
        message: `A team named "${data.name}" already exists for the ${data.season} season`,
      });
      showToast("Please fix the errors below", "error");
      return;
    }

    try {
      // Convert form data to FormData for the server action
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const result = await upsertTeam(null, formData);

      if (result.error) {
        showToast(result.error, "error");
        if (result.fields) {
          // Set field-specific errors
          Object.entries(result.fields).forEach(([key, value]) => {
            setError(key as keyof TeamFormData, {
              message: Array.isArray(value) ? value.join(", ") : value ?? "",
            });
          });
        }
      } else if (result.success && result.team) {
        const isNew = !teamToEdit?.id;
        showToast(result.success, "success");
        onSaveSuccess(result.team, isNew);

        if (isNew) {
          reset();
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showToast("An unexpected error occurred", "error");
    }
  };

  const handleCancel = () => {
    reset();
    clearErrors();
    clearUploadError();
    onCancelEdit();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-6 border rounded-lg bg-white shadow-sm"
    >
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
            {...register("name")}
            className={`w-full p-3 border text-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            placeholder="e.g., Vipers, Eagles, Thunder"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
              {...register("season")}
              className={`w-full p-3 border text-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.season ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            >
              <option value="">Select a season</option>
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
            {errors.season && (
              <p className="mt-1 text-sm text-red-600">
                {errors.season.message}
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
              type="number"
              {...register("year", { valueAsNumber: true })}
              className="w-full p-3 border text-slate-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="2025"
            />
            {errors.year && (
              <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
            )}
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

          {teamImageUrl && (
            <div className="mb-3">
              <Image
                src={teamImageUrl}
                alt="Team Preview"
                width={96}
                height={96}
                className="w-24 h-24 object-cover rounded-lg border-2 border-slate-200"
              />
            </div>
          )}

          <div className="flex items-center space-x-3">
            <label className="cursor-pointer">
              <input
                id="team_image_upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
              <div
                className={`
                  flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors
                  ${
                    isUploading
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </>
                )}
              </div>
            </label>
            <span className="text-xs text-slate-500">
              PNG, JPG, or GIF up to 10MB
            </span>
          </div>

          {uploadError && (
            <div className="mt-2 flex items-center text-red-600 text-sm">
              <X className="h-4 w-4 mr-1" />
              {uploadError}
            </div>
          )}
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
              type="color"
              {...register("primary_color")}
              className="w-full h-12 p-1 border border-gray-300 rounded-lg cursor-pointer"
            />
            {errors.primary_color && (
              <p className="mt-1 text-sm text-red-600">
                {errors.primary_color.message}
              </p>
            )}
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
              type="color"
              {...register("secondary_color")}
              className="w-full h-12 p-1 border border-gray-300 rounded-lg cursor-pointer"
            />
            {errors.secondary_color && (
              <p className="mt-1 text-sm text-red-600">
                {errors.secondary_color.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Coach Information Section */}
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
            {...register("coach_name")}
            className={`w-full p-3 border text-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.coach_name ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            placeholder="e.g., Sarah Johnson"
          />
          {errors.coach_name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.coach_name.message}
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
              type="email"
              {...register("coach_email")}
              className={`w-full p-3 border text-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.coach_email
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="coach@example.com"
            />
            {errors.coach_email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.coach_email.message}
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
              type="tel"
              {...register("coach_phone")}
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
