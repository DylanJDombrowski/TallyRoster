// app/dashboard/players/components/image-uploader.tsx - FIXED
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface ImageUploaderProps {
  initialImageUrl: string | null;
  onUploadSuccess: (url: string) => void;
  uploadPreset?: string;
}

export function ImageUploader({
  initialImageUrl,
  onUploadSuccess,
  uploadPreset = "organization_logos", // Default for organizations
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(initialImageUrl);
  }, [initialImageUrl]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("🖼️ Starting image upload:", {
      fileName: file.name,
      fileSize: file.size,
      uploadPreset,
    });

    // Validate file
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError("File size must be under 10MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    // Show temporary preview
    const tempPreview = URL.createObjectURL(file);
    setPreviewUrl(tempPreview);

    try {
      // Check environment variables
      if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
        throw new Error("Cloudinary configuration missing");
      }

      const timestamp = Math.round(new Date().getTime() / 1000);

      // Prepare signing parameters
      const paramsToSign = {
        timestamp: timestamp.toString(),
        upload_preset: uploadPreset,
        folder: uploadPreset === "organization_logos" ? "organizations" : "players", // Organize by folder
      };

      console.log("🔐 Getting signature for:", paramsToSign);

      // Get signature from your API
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
      console.log("✅ Signature received");

      // Prepare form data for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("upload_preset", uploadPreset);

      // Add folder organization
      if (uploadPreset === "organization_logos") {
        formData.append("folder", "organizations");
      } else {
        formData.append("folder", "players");
      }

      console.log("☁️ Uploading to Cloudinary...");

      // Upload to Cloudinary
      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error("❌ Cloudinary upload failed:", errorData);
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const uploadData = await uploadResponse.json();
      console.log("✅ Upload successful:", uploadData);

      if (uploadData.secure_url) {
        const finalUrl = uploadData.secure_url;
        setPreviewUrl(finalUrl);
        onUploadSuccess(finalUrl);
        setError(null);
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (error) {
      console.error("💥 Upload error:", error);
      setError(error instanceof Error ? error.message : "Upload failed");
      setPreviewUrl(initialImageUrl); // Revert to initial image
    } finally {
      setIsUploading(false);
      // Clean up temporary preview
      if (tempPreview.startsWith("blob:")) {
        URL.revokeObjectURL(tempPreview);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border-2 border-slate-300">
        {previewUrl ? (
          <Image src={previewUrl} alt="Logo preview" width={128} height={128} className="object-cover w-full h-full" priority />
        ) : (
          <span className="text-slate-500 text-xs text-center p-2">No Image</span>
        )}
      </div>

      {error && <div className="text-red-500 text-sm text-center max-w-xs">{error}</div>}

      <label
        htmlFor="image-upload"
        className={`cursor-pointer px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
          isUploading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-slate-600 text-white hover:bg-slate-700"
        }`}
      >
        {isUploading ? "Uploading..." : "Change Image"}
      </label>

      <input id="image-upload" type="file" accept="image/*" onChange={handleUpload} disabled={isUploading} className="hidden" />

      <p className="text-xs text-slate-500 text-center max-w-xs">PNG, JPG, or GIF up to 10MB</p>
    </div>
  );
}
