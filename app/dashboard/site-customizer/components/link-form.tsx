// app/dashboard/site-customizer/components/link-form.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createOrganizationLink, updateOrganizationLink } from "../actions";

const initialState = {
  success: false,
  message: "",
  errors: undefined,
};

interface LinkFormProps {
  onSuccess: () => void;
  buttonText: string;
  initialData?: {
    id?: string;
    title: string;
    description: string | null;
    url: string;
  };
}

export function LinkForm({ onSuccess, buttonText, initialData }: LinkFormProps) {
  // Choose the action based on whether we're editing or creating
  const action = initialData?.id ? updateOrganizationLink : createOrganizationLink;
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { showToast } = useToast();
  const [urlValidation, setUrlValidation] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (state.success) {
      showToast(state.message, "success");
      if (!initialData?.id) {
        formRef.current?.reset(); // Only reset form for new links, not edits
      }
      onSuccess(); // Call the callback to refresh the parent component
    } else if (state.message) {
      showToast(state.message, "error");
    }
  }, [state, showToast, onSuccess, initialData?.id]);

  // Simple URL validation function
  const validateUrl = async (url: string) => {
    if (!url) {
      setUrlValidation(null);
      return;
    }

    try {
      new URL(url); // Basic URL format validation
      setUrlValidation({
        isValid: true,
        message: "Valid URL format",
      });
    } catch {
      setUrlValidation({
        isValid: false,
        message: "Invalid URL format",
      });
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (url) {
      validateUrl(url);
    } else {
      setUrlValidation(null);
    }
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {/* Hidden field for edit mode */}
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initialData?.title}
          className="w-full p-2 border border-slate-300 rounded-md shadow-sm text-slate-900 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Registration Form, Tryout Information"
        />
        {state.errors?.title && <p className="text-red-500 text-sm mt-1">{state.errors.title[0]}</p>}
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1">
          URL
        </label>
        <input
          id="url"
          name="url"
          type="url"
          required
          defaultValue={initialData?.url}
          onChange={handleUrlChange}
          className={`w-full p-2 border rounded-md shadow-sm text-slate-900 focus:ring-blue-500 focus:border-blue-500 ${
            urlValidation?.isValid === false ? "border-red-300" : "border-slate-300"
          }`}
          placeholder="https://example.com/form"
        />
        {urlValidation && (
          <p className={`text-sm mt-1 ${urlValidation.isValid ? "text-green-600" : "text-red-500"}`}>{urlValidation.message}</p>
        )}
        {state.errors?.url && <p className="text-red-500 text-sm mt-1">{state.errors.url[0]}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialData?.description || ""}
          className="w-full p-2 border border-slate-300 rounded-md shadow-sm text-slate-900 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Brief description of this link (e.g., 'Complete this form to register for the upcoming season')"
        />
        {state.errors?.description && <p className="text-red-500 text-sm mt-1">{state.errors.description[0]}</p>}
      </div>

      <SubmitButton text={buttonText} disabled={urlValidation?.isValid === false} />
    </form>
  );
}

function SubmitButton({ text, disabled }: { text: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full p-2 rounded-lg text-white font-bold bg-blue-600 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Saving..." : text}
    </button>
  );
}
