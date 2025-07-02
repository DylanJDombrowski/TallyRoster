// app/dashboard/players/components/image-uploader.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  initialImageUrl: string | null;
  onUploadSuccess: (url: string) => void;
  uploadPreset?: string;
}

export function ImageUploader({
  initialImageUrl,
  onUploadSuccess,
  uploadPreset = "sideline_signed_preset",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl);

  // When the initialImageUrl prop changes (e.g., when a new player is selected for editing),
  // update the preview URL.
  useEffect(() => {
    setPreviewUrl(initialImageUrl);
  }, [initialImageUrl]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Show a temporary local preview of the selected file
    setPreviewUrl(URL.createObjectURL(file));

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = {
      timestamp: timestamp,
      upload_preset: uploadPreset,
    };

    const response = await fetch("/api/sign-image", {
      method: "POST",
      body: JSON.stringify({ paramsToSign }),
    });
    const { signature } = await response.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "api_key",
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string
    );
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("upload_preset", uploadPreset);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

    try {
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadResponse.json();

      if (uploadData.secure_url) {
        const finalUrl = uploadData.secure_url;
        setPreviewUrl(finalUrl); // Update preview to the final Cloudinary URL
        onUploadSuccess(finalUrl); // Pass the URL back to the parent form
      } else {
        // If upload fails, revert to the initial image
        setPreviewUrl(initialImageUrl);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setPreviewUrl(initialImageUrl); // Revert on error
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border-2 border-slate-300">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Player headshot"
            width={128}
            height={128}
            className="object-cover w-full h-full"
            priority // Prioritize loading the player image
          />
        ) : (
          <span className="text-slate-500 text-xs text-center p-2">
            No Headshot
          </span>
        )}
      </div>
      <label
        htmlFor="headshot-upload"
        className="cursor-pointer bg-slate-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-slate-700 transition-colors"
      >
        {isUploading ? "Uploading..." : "Change Headshot"}
      </label>
      <input
        id="headshot-upload"
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={isUploading}
        className="hidden"
      />
    </div>
  );
}
