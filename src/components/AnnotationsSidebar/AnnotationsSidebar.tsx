"use client";

import {
  Circle as CircleIcon,
  ChevronRight,
  Edit3,
  Layers,
  Minus,
  Search,
  Square,
  Trash2,
  Type,
} from "lucide-react";
import type { Annotation } from "@/features/annotations/types/annotation.types";
import { COLORS } from "@/utils/constants";

type AnnotationsSidebarProps = {
  annotations: Annotation[];
  selectedId: string | null;
  inspectorOpen: boolean;
  onSelectAnnotation: (id: string) => void;
  onToggleInspector: (id: string) => void;
  onOpenInspector: () => void;
  onCloseInspector: () => void;
  onDeleteAnnotation: (id: string) => void;
  onMoveAnnotation: (id: string, x: number, y: number) => void;
  onSetAnnotationColor: (color: string) => void;
  onUpdateRectangle: (width: number, height: number, color: string) => void;
  onUpdateCircle: (radius: number, color: string) => void;
  onUpdateLine: (endX: number, endY: number, color: string) => void;
  onUpdateText: (text: string, fontSize: number, color: string) => void;
};

const NumberField = ({
  label,
  value,
  min,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
}) => {
  return (
    <label className="space-y-1.5">
      <span className="text-xs text-app-text-muted">{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => {
          const nextValue = Number(event.target.value);
          if (Number.isNaN(nextValue)) return;
          onChange(nextValue);
        }}
        className="w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
};

export const AnnotationsSidebar = ({
  annotations,
  selectedId,
  inspectorOpen,
  onSelectAnnotation,
  onToggleInspector,
  onOpenInspector,
  onCloseInspector,
  onDeleteAnnotation,
  onMoveAnnotation,
  onSetAnnotationColor,
  onUpdateRectangle,
  onUpdateCircle,
  onUpdateLine,
  onUpdateText,
}: AnnotationsSidebarProps) => {
  const selectedAnnotation =
    annotations.find((annotation) => annotation.id === selectedId) ?? null;

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-app-border bg-app-surface">
      <div className="flex items-center justify-between border-b border-app-border p-4">
        <div className="flex items-center gap-2 font-bold text-app-text">
          <Layers size={18} className="text-brand" />
          <span>Annotations</span>
        </div>
        <span className="rounded-full bg-app-surface-soft px-2 py-0.5 text-xs font-bold text-app-text-muted">
          {annotations.length}
        </span>
      </div>

      <div className="flex-1 min-h-0 space-y-1 overflow-y-auto p-2">
        {annotations.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center p-4 text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-app-surface-muted text-app-text-soft">
              <Search size={20} />
            </div>
            <p className="text-xs text-app-text-soft">
              No annotations yet. Use the toolbar to start drawing.
            </p>
          </div>
        ) : (
          annotations.map((annotation) => {
            const isSelected = annotation.id === selectedId;
            const title =
              annotation.kind.charAt(0).toUpperCase() + annotation.kind.slice(1);
            const subtitle =
              annotation.kind === "text" && annotation.text.trim().length > 0
                ? `${title} - ${annotation.text.trim().slice(0, 30)}`
                : `${title} annotation`;

            const icon =
              annotation.kind === "rectangle" ? (
                <Square size={14} />
              ) : annotation.kind === "circle" ? (
                <CircleIcon size={14} />
              ) : annotation.kind === "line" ? (
                <Minus size={14} />
              ) : (
                <Type size={14} />
              );

            return (
              <div
                key={annotation.id}
                className={[
                  "rounded-xl border transition-all",
                  isSelected
                    ? "border-brand-soft-strong bg-brand-ghost/70 text-brand"
                    : "border-transparent bg-app-surface text-app-text-muted hover:bg-app-surface-muted",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => onSelectAnnotation(annotation.id)}
                    className="flex flex-1 items-center gap-3 rounded-lg p-1 text-left"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-app-border bg-app-surface shadow-sm">
                      {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold capitalize">
                        {title}
                      </p>
                      <p className="truncate text-xs text-app-text-soft">
                        {subtitle}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleInspector(annotation.id)}
                    className="rounded-lg p-2 transition-colors hover:bg-app-surface/80"
                    aria-label={
                      isSelected && inspectorOpen
                        ? "Collapse annotation editor"
                        : "Expand annotation editor"
                    }
                  >
                    <ChevronRight
                      size={14}
                      className={[
                        "transition-transform",
                        isSelected && inspectorOpen ? "rotate-90" : "",
                      ].join(" ")}
                    />
                  </button>
                </div>

                {isSelected ? (
                  <div className="flex items-center gap-2 px-3 pb-3">
                    <button
                      type="button"
                      onClick={onOpenInspector}
                      className="inline-flex items-center gap-2 rounded-lg border border-brand-soft-strong bg-app-surface px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft/60"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAnnotation(annotation.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-danger-border bg-danger-text px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {selectedAnnotation && inspectorOpen ? (
        <div className="space-y-4 border-t border-app-border bg-app-surface-muted p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-app-text-soft">
                Edit Annotation
              </p>
              <p className="mt-1 text-sm font-semibold capitalize text-app-text">
                {selectedAnnotation.kind}
              </p>
            </div>
            <button
              type="button"
              onClick={onCloseInspector}
              className="text-xs font-semibold text-app-text-muted hover:text-app-text"
            >
              Close
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Position X"
                value={selectedAnnotation.x}
                onChange={(value) =>
                  onMoveAnnotation(selectedAnnotation.id, value, selectedAnnotation.y)
                }
              />
              <NumberField
                label="Position Y"
                value={selectedAnnotation.y}
                onChange={(value) =>
                  onMoveAnnotation(selectedAnnotation.id, selectedAnnotation.x, value)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-app-text-muted">Color</span>
              <div className="flex gap-1.5">
                {COLORS.map((color) => {
                  const isSelectedColor = selectedAnnotation.color === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => onSetAnnotationColor(color)}
                      className={[
                        "h-4 w-4 rounded-full border border-white ring-1 ring-slate-200 transition-transform hover:scale-125",
                        isSelectedColor ? "scale-110 ring-2 ring-brand" : "",
                      ].join(" ")}
                      style={{ backgroundColor: color }}
                      aria-label={`Set annotation color ${color}`}
                    />
                  );
                })}
              </div>
            </div>

            {selectedAnnotation.kind === "rectangle" ? (
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Width"
                  value={selectedAnnotation.width}
                  min={1}
                  onChange={(value) =>
                    onUpdateRectangle(
                      Math.max(1, value),
                      selectedAnnotation.height,
                      selectedAnnotation.color
                    )
                  }
                />
                <NumberField
                  label="Height"
                  value={selectedAnnotation.height}
                  min={1}
                  onChange={(value) =>
                    onUpdateRectangle(
                      selectedAnnotation.width,
                      Math.max(1, value),
                      selectedAnnotation.color
                    )
                  }
                />
              </div>
            ) : null}

            {selectedAnnotation.kind === "circle" ? (
              <NumberField
                label="Radius"
                value={selectedAnnotation.radius}
                min={1}
                onChange={(value) =>
                  onUpdateCircle(Math.max(1, value), selectedAnnotation.color)
                }
              />
            ) : null}

            {selectedAnnotation.kind === "line" ? (
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="End X"
                  value={selectedAnnotation.x + selectedAnnotation.points[2]}
                  onChange={(value) =>
                    onUpdateLine(
                      value,
                      selectedAnnotation.y + selectedAnnotation.points[3],
                      selectedAnnotation.color
                    )
                  }
                />
                <NumberField
                  label="End Y"
                  value={selectedAnnotation.y + selectedAnnotation.points[3]}
                  onChange={(value) =>
                    onUpdateLine(
                      selectedAnnotation.x + selectedAnnotation.points[2],
                      value,
                      selectedAnnotation.color
                    )
                  }
                />
              </div>
            ) : null}

            {selectedAnnotation.kind === "text" ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <span className="text-xs text-app-text-muted">Content</span>
                  <textarea
                    value={selectedAnnotation.text}
                    onChange={(event) =>
                      onUpdateText(
                        event.target.value,
                        selectedAnnotation.fontSize,
                        selectedAnnotation.color
                      )
                    }
                    className="min-h-24 w-full rounded-lg border border-app-border bg-app-surface p-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                <NumberField
                  label="Font Size"
                  value={selectedAnnotation.fontSize}
                  min={8}
                  onChange={(value) =>
                    onUpdateText(
                      selectedAnnotation.text,
                      Math.max(8, value),
                      selectedAnnotation.color
                    )
                  }
                />
              </div>
            ) : null}

            {selectedAnnotation.kind !== "text" ? (
              <div className="rounded-lg border border-dashed border-app-border-strong bg-app-surface/70 px-3 py-2 text-xs text-app-text-muted">
                Move with drag, or fine-tune this annotation here using the edit
                controls above.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </aside>
  );
};


