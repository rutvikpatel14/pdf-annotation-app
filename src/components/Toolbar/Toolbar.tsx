"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AnnotationTool } from "@/features/annotations/types/annotation.types";
import * as Dialog from "@radix-ui/react-dialog";
import {
  CheckCircle2,
  Download,
  FileWarning,
  FileText,
  Minus as MinusIcon,
  Plus,
  Upload,
} from "lucide-react";

type ToolbarProps = {
  tool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  onExportJson: () => string;
  onImportJson: (json: string) => void;
  zoom: number;
  onZoomChange: (nextZoom: number) => void;
};

type ToastState = {
  tone: "success" | "error";
  text: string;
} | null;

function ToolButton({
  active,
  label,
  onClick,
  icon,
  title,
  disabled,
}: {
  active: boolean;
  label: string;
  title?: string;
  onClick: () => void;
  icon: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title ?? label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm font-medium",
        active
          ? "bg-white text-[#2563EB] shadow-sm"
          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

function IconSquare() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function IconCircle() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function IconLine() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path d="M5 19L19 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="5" cy="19" r="1.5" fill="currentColor" />
      <circle cx="19" cy="5" r="1.5" fill="currentColor" />
    </svg>
  );
}
function IconText() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path
        d="M4 6V4h16v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M9 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconSelect() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path
        d="M4 4l6 16 2-6 6-2L4 4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Toolbar({
  tool,
  onToolChange,
  onExportJson,
  onImportJson,
  zoom,
  onZoomChange,
}: ToolbarProps) {
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleExport = () => {
    try {
      const json = onExportJson();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "annotations.json";
      a.click();
      URL.revokeObjectURL(url);
      setToast({ tone: "success", text: "Annotations exported successfully." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed.";
      setToast({ tone: "error", text: msg });
    }
  };

  const handleImportConfirm = () => {
    try {
      onImportJson(importText);
      setToast({ tone: "success", text: "Annotations imported successfully." });
      setImportOpen(false);
      setImportText("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Import failed.";
      setToast({ tone: "error", text: msg });
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-auto pb-1">
            <div className="flex items-center gap-2 mr-4 shrink-0">
              <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center text-white">
                <FileText size={18} />
              </div>
              <span className="font-bold text-slate-800 tracking-tight hidden sm:block">
                AnnotatePDF
              </span>
            </div>

            <div className="hidden md:block h-8 w-[1px] bg-[#E5E7EB] mx-2" />
            <ToolButton
              active={tool === "select"}
              label="Select"
              title="Select & drag annotations"
              icon={<IconSelect />}
              onClick={() => onToolChange("select")}
            />
            <ToolButton
              active={tool === "rectangle"}
              label="Rectangle"
              icon={<IconSquare />}
              onClick={() => onToolChange("rectangle")}
            />
            <ToolButton
              active={tool === "circle"}
              label="Circle"
              icon={<IconCircle />}
              onClick={() => onToolChange("circle")}
            />
            <ToolButton
              active={tool === "line"}
              label="Line"
              icon={<IconLine />}
              onClick={() => onToolChange("line")}
            />
            <ToolButton
              active={tool === "text"}
              label="Text"
              icon={<IconText />}
              onClick={() => onToolChange("text")}
            />

          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center bg-slate-100 rounded-lg p-1 gap-1 mr-2">
              <button
                type="button"
                onClick={() => onZoomChange(Math.max(25, zoom - 10))}
                className="p-1 hover:bg-white rounded transition-colors text-slate-600"
                title="Zoom out"
              >
                <MinusIcon size={14} />
              </button>
              <span className="text-xs font-mono w-12 text-center text-slate-600">
                {Math.round(zoom)}%
              </span>
              <button
                type="button"
                onClick={() => onZoomChange(Math.min(400, zoom + 10))}
                className="p-1 hover:bg-white rounded transition-colors text-slate-600"
                title="Zoom in"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="rounded-lg bg-[#2563EB] text-white px-3 py-2 text-sm font-medium hover:bg-[#1D4ED8] transition flex items-center gap-2"
            >
              <Download size={16} />
              <span className="hidden md:inline">Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="rounded-lg bg-white border border-[#E5E7EB] text-[#111827] px-3 py-2 text-sm font-medium hover:bg-[#F3F4F6] transition flex items-center gap-2"
            >
              <Upload size={16} />
              <span className="hidden md:inline">Import</span>
            </button>
          </div>
        </div>

      </div>

      <Dialog.Root open={importOpen} onOpenChange={setImportOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-lg border border-[#E5E7EB] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Dialog.Title className="text-base font-semibold text-[#111827]">
                  Import annotations
                </Dialog.Title>
                <Dialog.Description className="text-sm text-[#6B7280] mt-1">
                  Paste the exported JSON payload. Coordinates will be scaled to the current page size.
                </Dialog.Description>
              </div>

              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 hover:bg-[#F3F4F6]"
                  onClick={() => setToast(null)}
                >
                  Close
                </button>
              </Dialog.Close>
            </div>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="mt-3 w-full min-h-44 rounded-lg border border-[#E5E7EB] p-3 text-sm"
              placeholder='Paste JSON here, e.g. { "version": 1, "page": { ... }, "annotations": [...] }'
            />

            <div className="mt-3 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm font-medium hover:bg-[#F3F4F6]"
                  onClick={() => {
                    setImportText("");
                    setToast(null);
                  }}
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="button"
                className="rounded-lg bg-[#2563EB] text-white px-3 py-2 text-sm font-medium hover:bg-[#1D4ED8] transition"
                onClick={handleImportConfirm}
              >
                Import
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {toast ? (
        <div className="pointer-events-none fixed right-4 top-4 z-[70]">
          <div
            className={[
              "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur",
              toast.tone === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-900"
                : "border-rose-200 bg-rose-50/95 text-rose-900",
            ].join(" ")}
            role="status"
            aria-live="polite"
          >
            {toast.tone === "success" ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            ) : (
              <FileWarning size={18} className="mt-0.5 shrink-0" />
            )}
            <p className="text-sm font-medium">{toast.text}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
