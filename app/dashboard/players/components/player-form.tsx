// app/dashboard/players/components/player-form.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { createClient } from "@/lib/supabase/client";
import { Player, PlayerFormData, PlayerFormSchema, Team } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Save,
  TrendingUp,
  Twitter,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ImageUploader } from "./image-uploader";

interface PlayerFormProps {
  teams: Team[];
  playerToEdit?: Player | null;
  onSaveSuccess: (savedPlayer: Player, isNew: boolean) => void;
  onCancelEdit: () => void;
  organizationId: string;
}

type FormSectionProps = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
};

const FormSection = ({
  title,
  icon: Icon,
  children,
  isCollapsible = false,
  defaultExpanded = true,
}: FormSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div
        className={`px-4 py-3 bg-gray-50 border-b border-gray-200 ${
          isCollapsible ? "cursor-pointer hover:bg-gray-100" : ""
        }`}
        onClick={isCollapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          {isCollapsible && (
            <div className="text-gray-400">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
      </div>
      {isExpanded && <div className="p-4">{children}</div>}
    </div>
  );
};

export function PlayerForm({
  teams,
  playerToEdit,
  onSaveSuccess,
  onCancelEdit,
  organizationId,
}: PlayerFormProps) {
  const supabase = createClient();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<PlayerFormData>({
    resolver: zodResolver(PlayerFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      jersey_number: undefined,
      position: "",
      team_id: "",
      headshot_url: null,
      height: "",
      bats: null,
      throws: null,
      town: "",
      school: "",
      grad_year: undefined,
      gpa: undefined,
      twitter_handle: "",
      parent_email: "",
    },
  });

  const headshotUrl = watch("headshot_url");

  useEffect(() => {
    if (playerToEdit) {
      const formData: PlayerFormData = {
        ...playerToEdit,
        bats: playerToEdit.bats as "L" | "R" | "S" | null,
        throws: playerToEdit.throws as "L" | "R" | null,
      };
      reset(formData);
    } else {
      reset({
        first_name: "",
        last_name: "",
        jersey_number: undefined,
        position: "",
        team_id: "",
        headshot_url: null,
        height: "",
        bats: null,
        throws: null,
        town: "",
        school: "",
        grad_year: undefined,
        gpa: undefined,
        twitter_handle: "",
        parent_email: "",
      });
    }
  }, [playerToEdit, reset]);

  const onSubmit: SubmitHandler<PlayerFormData> = async (data) => {
    try {
      let savedPlayer: Player | null = null;
      const isNew = !data.id;

      const payload = { ...data, organization_id: organizationId };
      delete (payload as Partial<PlayerFormData>).id;

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

      showToast(
        `Player ${isNew ? "created" : "updated"} successfully!`,
        "success"
      );
      onSaveSuccess(savedPlayer!, isNew);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      showToast(`Error saving player: ${errorMessage}`, "error");
      console.error("Error saving player:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {playerToEdit ? "Edit Player" : "Add New Player"}
              </h1>
              {playerToEdit && (
                <p className="text-sm text-gray-500">
                  {playerToEdit.first_name} {playerToEdit.last_name} • #
                  {playerToEdit.jersey_number}
                </p>
              )}
            </div>
            <button
              onClick={onCancelEdit}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form
          onSubmit={handleSubmit(onSubmit, (formErrors) => {
            console.error("Form validation errors:", formErrors);
            showToast("Please fix the errors before submitting.", "error");
          })}
          className="space-y-6"
        >
          {/* Photo Upload */}
          <div className="text-center">
            <ImageUploader
              initialImageUrl={headshotUrl || null}
              onUploadSuccess={(url: string) =>
                setValue("headshot_url", url, { shouldValidate: true })
              }
              uploadPreset="player_headshots"
            />
          </div>

          {/* Essential Information */}
          <FormSection title="Essential Information" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  {...register("first_name")}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.first_name ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  {...register("last_name")}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.last_name ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.last_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jersey Number *
                </label>
                <input
                  type="number"
                  {...register("jersey_number")}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.jersey_number ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.jersey_number && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.jersey_number.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team *
                </label>
                <select
                  {...register("team_id")}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.team_id ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a team...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                {errors.team_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.team_id.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <input
                  {...register("position")}
                  placeholder="e.g., Pitcher, Catcher, Shortstop"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.position.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Email
                </label>
                <input
                  type="email"
                  {...register("parent_email")}
                  placeholder="parent@example.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.parent_email ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.parent_email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.parent_email.message}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          {/* Baseball Information */}
          <FormSection
            title="Baseball Information"
            icon={TrendingUp}
            isCollapsible
            defaultExpanded={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height
                </label>
                <input
                  {...register("height")}
                  placeholder="e.g., 5'10&quot;"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.height && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.height.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bats
                </label>
                <select
                  {...register("bats")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="R">Right</option>
                  <option value="L">Left</option>
                  <option value="S">Switch</option>
                </select>
                {errors.bats && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.bats.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Throws
                </label>
                <select
                  {...register("throws")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="R">Right</option>
                  <option value="L">Left</option>
                </select>
                {errors.throws && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.throws.message}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          {/* Academic Information */}
          <FormSection
            title="Academic Information"
            icon={GraduationCap}
            isCollapsible
            defaultExpanded={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School
                </label>
                <input
                  {...register("school")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.school && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.school.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Graduation Year
                </label>
                <input
                  type="number"
                  {...register("grad_year")}
                  min="2020"
                  max="2035"
                  placeholder="e.g., 2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.grad_year && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.grad_year.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  {...register("gpa")}
                  placeholder="e.g., 3.8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.gpa && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.gpa.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Town
                </label>
                <input
                  {...register("town")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.town && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.town.message}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          {/* Social Media */}
          <FormSection
            title="Social Media"
            icon={Twitter}
            isCollapsible
            defaultExpanded={false}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter Handle
              </label>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-2 text-gray-500 bg-gray-200 border border-r-0 border-gray-300 rounded-l-lg">
                  @
                </span>
                <input
                  {...register("twitter_handle")}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="username"
                />
              </div>
              {errors.twitter_handle && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.twitter_handle.message}
                </p>
              )}
            </div>
          </FormSection>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto">
              <button
                type="button"
                onClick={onCancelEdit}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-primary-foreground)",
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Player
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
