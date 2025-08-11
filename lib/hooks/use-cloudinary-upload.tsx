// lib/hooks/use-cloudinary-upload.ts
import { useState } from "react";

interface CloudinaryUploadOptions {
  uploadPreset: string;
  folder?: string;
  maxFileSize?: number; // in bytes
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

interface CloudinaryUploadReturn {
  isUploading: boolean;
  error: string | null;
  uploadImage: (file: File) => Promise<string | null>;
  clearError: () => void;
}

export function useCloudinaryUpload({
  uploadPreset,
  folder,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  onSuccess,
  onError,
}: CloudinaryUploadOptions): CloudinaryUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      const errorMsg = "Please select an image file";
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      const errorMsg = `File size must be under ${Math.round(
        maxFileSize / (1024 * 1024)
      )}MB`;
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      const timestamp = Math.round(new Date().getTime() / 1000);

      const paramsToSign: Record<string, string> = {
        timestamp: timestamp.toString(),
        upload_preset: uploadPreset,
      };

      if (folder) {
        paramsToSign.folder = folder;
      }

      // Get signature from API
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

      // Prepare form data for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("upload_preset", uploadPreset);

      if (folder) {
        formData.append("folder", folder);
      }

      // Upload to Cloudinary
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

      if (!uploadData.secure_url) {
        throw new Error("No URL returned from upload");
      }

      const imageUrl = uploadData.secure_url;
      onSuccess?.(imageUrl);
      return imageUrl;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Upload failed";
      setError(errorMsg);
      onError?.(errorMsg);
      console.error("Upload error:", err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    error,
    uploadImage,
    clearError,
  };
}
