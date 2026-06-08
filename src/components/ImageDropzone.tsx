"use client";

import { useRef, useState } from "react";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  previewClassName?: string;
}

export function ImageDropzone({ value, onChange, hint, previewClassName }: ImageDropzoneProps) {
  const { T } = useLanguage();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : T.dropzone.uploadError);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  if (value) {
    return (
      <div className="relative">
        <img
          src={value}
          alt="Event"
          className={previewClassName ?? "h-40 w-full rounded-lg object-cover border border-border/60"}
        />
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={T.dropzone.remove}
          className="absolute right-2 top-2 cursor-pointer rounded-full bg-foreground/60 p-1 text-background transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
        )}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <>
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {T.dropzone.prompt}{" "}
              <span className="text-primary underline">{T.dropzone.browse}</span>
            </p>
            <p className="text-xs text-muted-foreground">{hint ?? T.dropzone.defaultHint}</p>
            {!hint && (
              <p className="text-xs text-muted-foreground/60">{T.dropzone.optimalSize}</p>
            )}
          </>
        )}
      </button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
