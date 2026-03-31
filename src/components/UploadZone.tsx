"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, FileText, Loader2, X } from "lucide-react";

interface UploadZoneProps {
  onParsed: (text: string, pageCount: number, fileName: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

type UploadState = "idle" | "uploading" | "done" | "error";

export default function UploadZone({
  onParsed,
  onError,
  disabled,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        const msg = "Only PDF files are supported.";
        setErrorMsg(msg);
        setState("error");
        onError?.(msg);
        return;
      }

      setState("uploading");
      setFileName(file.name);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Upload failed");
        }

        if (
          typeof data.text !== "string" ||
          typeof data.fileName !== "string"
        ) {
          throw new Error(
            "Server returned an unexpected response. Please try again.",
          );
        }

        const pages = typeof data.pageCount === "number" ? data.pageCount : 0;
        setPageCount(pages);
        setState("done");
        onParsed(data.text, pages, data.fileName);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setErrorMsg(msg);
        setState("error");
        onError?.(msg);
      }
    },
    [onParsed, onError],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      uploadFile(files[0]);
    },
    [uploadFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (!disabled) handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles],
  );

  const reset = () => {
    setState("idle");
    setFileName(null);
    setPageCount(null);
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (state === "done" && fileName) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-950/40 border border-emerald-700/40">
        <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-emerald-300 truncate">
            {fileName}
          </p>
          <p className="text-xs text-emerald-500">
            {pageCount} pages extracted — ready to analyze
          </p>
        </div>
        <button
          onClick={reset}
          className="text-slate-500 hover:text-slate-300 transition-colors"
          title="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() =>
          !disabled && state !== "uploading" && inputRef.current?.click()
        }
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed
          px-6 py-8 cursor-pointer transition-all duration-200
          ${
            dragging
              ? "border-indigo-500 bg-indigo-950/30"
              : state === "error"
                ? "border-red-700/60 bg-red-950/20"
                : "border-slate-700 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/60"
          }
          ${disabled || state === "uploading" ? "cursor-not-allowed opacity-60" : ""}
        `}
      >
        {state === "uploading" ? (
          <>
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-300">Parsing {fileName}…</p>
            <p className="text-xs text-slate-500">
              Extracting text from all pages
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-slate-700/60 flex items-center justify-center">
              <Upload className="w-6 h-6 text-slate-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-200">
                {dragging ? "Drop your PDF here" : "Upload Revenue Contract"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Drag & drop or click — PDF up to 50MB
              </p>
            </div>
            {state === "error" && errorMsg && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/40 rounded px-3 py-1.5 max-w-xs text-center">
                {errorMsg}
              </p>
            )}
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled || state === "uploading"}
      />
    </div>
  );
}
