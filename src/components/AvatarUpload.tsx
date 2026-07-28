"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ImageIcon, XIcon } from "@/components/Icons";

type Props = {
  uid: string;
  url: string | null;
  onUpload: (url: string) => void;
  type: "avatar" | "cover";
};

export default function AvatarUpload({ uid, url, onUpload, type }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${uid}/${type}.${ext}`;

    const { error } = await supabase.storage
      .from("profiles")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("profiles")
      .getPublicUrl(filePath);

    onUpload(urlData.publicUrl);
    setPreview(null);
    setUploading(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("يرجى اختيار صورة بصيغة PNG أو JPEG أو WebP أو GIF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة يجب ألا يتجاوز 5 ميغابايت");
      return;
    }

    setPreview(URL.createObjectURL(file));
    uploadImage(file);
  };

  const removeImage = async () => {
    if (url) {
      const path = url.split("/profiles/")[1];
      if (path) {
        await supabase.storage.from("profiles").remove([path]);
      }
    }
    onUpload("");
  };

  const isCover = type === "cover";

  return (
    <div className={`relative ${isCover ? "w-full h-48" : "w-24 h-24"}`}>
      {preview || url ? (
        <div className={`relative ${isCover ? "w-full h-full" : "w-full h-full"} rounded-2xl overflow-hidden`}>
          <img
            src={preview || url!}
            alt={type}
            className={`w-full h-full object-cover ${!isCover ? "rounded-2xl" : ""}`}
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all"
          >
            <XIcon size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`${isCover ? "w-full h-full border-2 border-dashed border-border/50 hover:border-accent/50" : "w-full h-full border-2 border-dashed border-border/50 hover:border-accent/50 rounded-2xl"} flex flex-col items-center justify-center gap-1.5 bg-surface/50 hover:bg-surface/80 transition-all text-text-muted hover:text-accent`}
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          ) : (
            <>
              <ImageIcon size={isCover ? 24 : 20} />
              <span className="text-[10px]">{isCover ? "إضافة غلاف" : "إضافة صورة"}</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
