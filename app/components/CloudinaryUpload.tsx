// app/components/CloudinaryUpload.tsx
"use client";

import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useCloudinaryUpload } from "@/lib/hooks/use-cloudinary-upload";

interface CloudinaryUploadProps {
  onUpload: (url: string) => void;
  disabled?: boolean;
  uploadPreset?: string;
  folder?: string;
  maxFileSize?: number;
}

export default function CloudinaryUpload({
  onUpload,
  disabled = false,
  uploadPreset = "blog-images",
  folder,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
}: CloudinaryUploadProps) {
  const { isUploading, error, uploadImage, clearError } = useCloudinaryUpload({
    uploadPreset,
    folder,
    maxFileSize,
    onSuccess: onUpload,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      clearError();
      await uploadImage(file);
    }
  };

  return (
    <div className="w-full">
      <label className="block">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
        />
        <div
          className={`
            border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer
            transition-colors hover:border-gray-400 hover:bg-gray-50
            ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-sm text-gray-600">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload an image</p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to {Math.round(maxFileSize / (1024 * 1024))}MB
              </p>
            </div>
          )}
        </div>
      </label>

      {error && (
        <div className="mt-2 flex items-center text-red-600 text-sm">
          <X className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}

// Quick upload button for use in rich text editor toolbar
export function CloudinaryUploadButton({
  onUpload,
  disabled = false,
  uploadPreset = "blog-images",
  folder,
}: CloudinaryUploadProps) {
  const { isUploading, uploadImage } = useCloudinaryUpload({
    uploadPreset,
    folder,
    onSuccess: onUpload,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };

  return (
    <label className="cursor-pointer">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />
      <button
        type="button"
        disabled={disabled || isUploading}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50"
        title="Upload image"
      >
        {isUploading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        ) : (
          <ImageIcon className="w-4 h-4" />
        )}
      </button>
    </label>
  );
}
