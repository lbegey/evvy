"use client";

import { useRef, useState } from "react";
import { Paperclip, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

interface AttachmentDropzoneProps {
  url: string;
  name: string;
  onChange: (url: string, name: string) => void;
}

export function AttachmentDropzone({ url, name, onChange }: AttachmentDropzoneProps) {
  const { T } = useLanguage();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError("");
    if (file.size > MAX_FILE_SIZE) {
      setError(T.fileDropzone.fileTooLarge);
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/attachment", { method: "POST", body: fd });
      let json: { url?: string; error?: string } | null = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }
      if (!res.ok || !json) {
        if (res.status === 413 || /too large/i.test(json?.error ?? "")) {
          throw new Error(T.fileDropzone.fileTooLarge);
        }
        throw new Error(json?.error ?? T.fileDropzone.uploadError);
      }
      onChange(json.url!, file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : T.fileDropzone.uploadError);
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

  if (url) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
        <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-sm text-foreground">{name || url}</span>
        <button
          type="button"
          onClick={() => onChange("", "")}
          aria-label={T.fileDropzone.remove}
          className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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
          "flex h-20 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed transition-colors",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
        )}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Paperclip className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {T.fileDropzone.prompt}{" "}
              <span className="text-primary underline">{T.fileDropzone.browse}</span>
            </p>
            <p className="text-xs text-muted-foreground">{T.fileDropzone.hint}</p>
          </>
        )}
      </button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
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
