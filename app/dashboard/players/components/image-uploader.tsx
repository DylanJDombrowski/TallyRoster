// app/dashboard/players/components/image-uploader.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  initialImageUrl: string | null;
  onUpload: (filePath: string) => void;
}

export function ImageUploader({
  initialImageUrl,
  onUpload,
}: ImageUploaderProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      // Create a unique file path
      const filePath = `public/${Date.now()}_${file.name}`;

      // Upload the file to the 'player-headshots' bucket
      const { error: uploadError } = await supabase.storage
        .from("player-headshots")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL of the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("player-headshots").getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error("Could not get public URL for the uploaded file.");
      }

      // Update the preview and notify the parent form
      setPreviewUrl(publicUrl);
      onUpload(publicUrl);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert("Error uploading file: " + error.message);
      } else {
        alert("Error uploading file: An unknown error occurred.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Player Headshot
      </label>
      <div className="mt-1 flex items-center space-x-4">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Player headshot"
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        <div className="relative">
          <input
            type="file"
            id="headshot-upload"
            name="headshot-upload"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <label
            htmlFor="headshot-upload"
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            {uploading ? "Uploading..." : "Change"}
          </label>
        </div>
      </div>
    </div>
  );
}
