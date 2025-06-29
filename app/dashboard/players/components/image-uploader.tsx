// app/dashboard/players/components/image-uploader.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useRef, useState } from "react";

interface ImageUploaderProps {
  initialImageUrl: string | null;
  onUpload: (url: string) => void;
}

export function ImageUploader({ initialImageUrl, onUpload }: ImageUploaderProps) {
  const supabase = createClient();
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const filePath = `public/${Date.now()}_${file.name}`; // Unique file path

    setIsUploading(true);

    const { error: uploadError } = await supabase.storage.from("player-headshots").upload(filePath, file);

    if (uploadError) {
      alert("Error uploading file: " + uploadError.message);
      setIsUploading(false);
      return;
    }

    // THIS IS THE KEY: Get the public URL from the filePath.
    const {
      data: { publicUrl },
    } = supabase.storage.from("player-headshots").getPublicUrl(filePath);

    setImageUrl(publicUrl);
    onUpload(publicUrl); // Pass the full, correct URL to the form
    setIsUploading(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">Player Headshot</label>
      <div className="flex items-center gap-4">
        <div className="w-32 h-32 rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <Image src={imageUrl} alt="Player headshot" width={128} height={128} className="object-cover w-full h-full" />
          ) : (
            <span className="text-slate-500 text-sm">No Image</span>
          )}
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" disabled={isUploading} />
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isUploading}
          className="px-4 py-2 bg-slate-100 text-slate-800 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Upload Image"}
        </button>
      </div>
    </div>
  );
}
