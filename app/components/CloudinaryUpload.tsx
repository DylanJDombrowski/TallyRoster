"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface CloudinaryUploadProps {
  onUpload: (url: string) => void;
  disabled?: boolean;
}

export default function CloudinaryUpload({
  onUpload,
  disabled = false,
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToCloudinary = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);

      // Prepare upload parameters
      const timestamp = Math.round(new Date().getTime() / 1000);
      const uploadPreset =
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "blog-images";

      const paramsToSign = {
        timestamp: timestamp.toString(),
        upload_preset: uploadPreset,
      };

      // Get signature from your API
      const signResponse = await fetch("/api/sign-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paramsToSign }),
      });

      if (!signResponse.ok) {
        throw new Error("Failed to get upload signature");
      }

      const { signature } = await signResponse.json();

      // Prepare form data for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append(
        "api_key",
        process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || ""
      );
      formData.append("upload_preset", uploadPreset);

      // Upload to Cloudinary
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!cloudinaryResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await cloudinaryResponse.json();

      // Return optimized URL with auto format and quality
      const optimizedUrl = result.secure_url.replace(
        "/upload/",
        "/upload/f_auto,q_auto/"
      );
      onUpload(optimizedUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    uploadToCloudinary(file);
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
                PNG, JPG, GIF up to 5MB
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
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const timestamp = Math.round(new Date().getTime() / 1000);
      const uploadPreset =
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "blog-images";

      const paramsToSign = {
        timestamp: timestamp.toString(),
        upload_preset: uploadPreset,
      };

      const signResponse = await fetch("/api/sign-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paramsToSign }),
      });

      const { signature } = await signResponse.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append(
        "api_key",
        process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || ""
      );
      formData.append("upload_preset", uploadPreset);

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const result = await cloudinaryResponse.json();
      const optimizedUrl = result.secure_url.replace(
        "/upload/",
        "/upload/f_auto,q_auto/"
      );
      onUpload(optimizedUrl);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
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
