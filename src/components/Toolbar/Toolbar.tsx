"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AnnotationTool } from "@/features/annotations/types/annotation.types";
import * as Dialog from "@radix-ui/react-dialog";
import { downloadJsonFile } from "@/utils/exportUtils";
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

const ToolButton = ({
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
}) => {
  return (
    <button
      type="button"
      title={title ?? label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm font-medium",
        active
          ? "bg-app-surface text-brand shadow-sm"
          : "text-app-text-muted hover:bg-app-surface-soft hover:text-app-text",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
};

const IconSquare = () => {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
};
const IconCircle = () => {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
};
const IconLine = () => {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path d="M5 19L19 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="5" cy="19" r="1.5" fill="currentColor" />
      <circle cx="19" cy="5" r="1.5" fill="currentColor" />
    </svg>
  );
};
const IconText = () => {
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
};
const IconSelect = () => {
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
};

const Toolbar = ({
  tool,
  onToolChange,
  onExportJson,
  onImportJson,
  zoom,
  onZoomChange,
}: ToolbarProps) => {
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
      downloadJsonFile("annotations.json", json);
      setToast({ tone: "success", text: "Annotations exported successfully." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed.";
      console.error("Annotation export failed", err);
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
      console.error("Annotation import failed", err);
      setToast({ tone: "error", text: msg });
    }
  };

  return (
    <div className="sticky top-0 z-50 border-b border-app-border bg-app-surface/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-auto pb-1">
            <div className="flex items-center gap-2 mr-4 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                <FileText size={18} />
              </div>
              <span className="hidden font-bold tracking-tight text-app-text sm:block">
                AnnotatePDF
              </span>
            </div>

            <div className="mx-2 hidden h-8 w-px bg-app-border md:block" />
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
            <div className="mr-2 hidden items-center gap-1 rounded-lg bg-app-surface-soft p-1 lg:flex">
              <button
                type="button"
                onClick={() => onZoomChange(Math.max(25, zoom - 10))}
                className="rounded p-1 text-app-text-muted transition-colors hover:bg-app-surface hover:text-app-text"
                title="Zoom out"
              >
                <MinusIcon size={14} />
              </button>
              <span className="w-12 text-center font-mono text-xs text-app-text-muted">
                {Math.round(zoom)}%
              </span>
              <button
                type="button"
                onClick={() => onZoomChange(Math.min(400, zoom + 10))}
                className="rounded p-1 text-app-text-muted transition-colors hover:bg-app-surface hover:text-app-text"
                title="Zoom in"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-hover"
            >
              <Download size={16} />
              <span className="hidden md:inline">Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-app-border bg-app-surface px-3 py-2 text-sm font-medium text-app-text transition hover:bg-app-surface-soft"
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
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-app-border bg-app-surface p-4 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Dialog.Title className="text-base font-semibold text-app-text">
                  Import annotations
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-app-text-muted">
                  Paste the exported JSON payload. Coordinates will be scaled to the current page size.
                </Dialog.Description>
              </div>

              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 hover:bg-app-surface-soft"
                  onClick={() => setToast(null)}
                >
                  Close
                </button>
              </Dialog.Close>
            </div>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="mt-3 min-h-44 w-full rounded-lg border border-app-border p-3 text-sm"
              placeholder='Paste JSON here, e.g. { "version": 1, "page": { ... }, "annotations": [...] }'
            />

            <div className="mt-3 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg border border-app-border px-3 py-2 text-sm font-medium hover:bg-app-surface-soft"
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
                className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-hover"
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
                ? "border-success-border bg-success-bg/95 text-success-text"
                : "border-danger-border bg-danger-bg/95 text-danger-text",
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
};

export default Toolbar;
