"use client";

import { useMemo, useState } from "react";
import Toolbar from "@/components/Toolbar/Toolbar";
import { PdfViewer } from "@/components/PdfViewer/PdfViewer";
import { useAnnotations } from "@/features/annotations/hooks/useAnnotations";
import {
  Circle as CircleIcon,
  ChevronRight,
  Edit3,
  Layers,
  Minus,
  Search,
  Square,
  Type,
  Trash2,
} from "lucide-react";
import type {
  AnnotationTool,
  PageSize,
} from "@/features/annotations/types/annotation.types";
import { COLORS } from "@/utils/constants";

function NumberField({
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
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs text-slate-500">{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => {
          const nextValue = Number(e.target.value);
          if (Number.isNaN(nextValue)) return;
          onChange(nextValue);
        }}
        className="w-full text-sm p-2 rounded-lg border border-[#E5E7EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
      />
    </label>
  );
}

export default function HomePage() {
  const [tool, setTool] = useState<AnnotationTool>("select");
  const [pageSize, setPageSize] = useState<PageSize | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const {
    annotations,
    selectedId,
    selectAnnotation,
    addAnnotation,
    updateAnnotation,
    moveAnnotation,
    deleteAnnotation,
    exportJson,
    importJson,
  } = useAnnotations();

  const selectedAnnotation = useMemo(() => {
    if (!selectedId) return null;
    return annotations.find((a) => a.id === selectedId) ?? null;
  }, [annotations, selectedId]);

  const handleExportJson = () => {
    if (!pageSize) {
      throw new Error("Upload a PDF before exporting annotations.");
    }
    return exportJson(pageSize);
  };

  const handleImportJson = (json: string) => {
    if (!pageSize) {
      throw new Error("Upload a PDF before importing annotations.");
    }
    importJson(json, pageSize);
  };

  const handleSelectAnnotation = (id: string) => {
    selectAnnotation(id);
  };

  const handleToggleInspector = (id: string) => {
    if (selectedId !== id) {
      selectAnnotation(id);
      setInspectorOpen(true);
      return;
    }

    setInspectorOpen((prev) => !prev);
  };

  const handleSelectedPositionChange = (axis: "x" | "y", value: number) => {
    if (!selectedAnnotation) return;

    moveAnnotation({
      id: selectedAnnotation.id,
      x: axis === "x" ? value : selectedAnnotation.x,
      y: axis === "y" ? value : selectedAnnotation.y,
    });
  };

  const handleSelectedColorChange = (color: string) => {
    if (!selectedAnnotation) return;

    if (selectedAnnotation.kind === "rectangle") {
      updateAnnotation({
        id: selectedAnnotation.id,
        kind: "rectangle",
        updates: {
          width: selectedAnnotation.width,
          height: selectedAnnotation.height,
          color,
        },
      });
      return;
    }

    if (selectedAnnotation.kind === "circle") {
      updateAnnotation({
        id: selectedAnnotation.id,
        kind: "circle",
        updates: {
          radius: selectedAnnotation.radius,
          color,
        },
      });
      return;
    }

    if (selectedAnnotation.kind === "line") {
      updateAnnotation({
        id: selectedAnnotation.id,
        kind: "line",
        updates: {
          points: selectedAnnotation.points,
          color,
        },
      });
      return;
    }

    updateAnnotation({
      id: selectedAnnotation.id,
      kind: "text",
      updates: {
        text: selectedAnnotation.text,
        fontSize: selectedAnnotation.fontSize,
        color,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toolbar
        tool={tool}
        onToolChange={setTool}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      <div className="flex-1 min-h-0 flex">
        <div className="flex-1 min-w-0">
          <PdfViewer
            tool={tool}
            onToolChange={setTool}
            annotations={annotations}
            selectedId={selectedId}
            onSelectAnnotation={(id) => {
              selectAnnotation(id);
              if (id === null) {
                setInspectorOpen(false);
              }
            }}
            onAddAnnotation={addAnnotation}
            onUpdateAnnotation={updateAnnotation}
            onMoveAnnotation={moveAnnotation}
            onStageSizeChange={setPageSize}
            zoom={zoom}
          />
        </div>

        <aside className="sticky top-[73px] h-[calc(100vh-73px)] w-72 shrink-0 border-l border-[#E5E7EB] bg-white flex flex-col z-40">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Layers size={18} className="text-[#2563EB]" />
                <span>Annotations</span>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {annotations.length}
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
              {annotations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                    <Search size={20} />
                  </div>
                  <p className="text-xs text-slate-400">
                    No annotations yet. Use the toolbar to start drawing.
                  </p>
                </div>
              ) : (
                annotations.map((ann) => {
                  const isSelected = ann.id === selectedId;
                  const title = ann.kind.charAt(0).toUpperCase() + ann.kind.slice(1);
                  const subtitle =
                    ann.kind === "text" && ann.text.trim().length > 0
                      ? `${title} - ${ann.text.trim().slice(0, 30)}`
                      : `${title} annotation`;

                  const icon =
                    ann.kind === "rectangle" ? (
                      <Square size={14} />
                    ) : ann.kind === "circle" ? (
                      <CircleIcon size={14} />
                    ) : ann.kind === "line" ? (
                      <Minus size={14} />
                    ) : (
                      <Type size={14} />
                    );

                  return (
                    <div
                      key={ann.id}
                      className={[
                        "rounded-xl border transition-all",
                        isSelected
                          ? "bg-blue-50/70 text-[#2563EB] border-[#BFDBFE]"
                          : "bg-white text-slate-600 border-transparent hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2 p-2">
                        <button
                          type="button"
                          onClick={() => handleSelectAnnotation(ann.id)}
                          className="flex-1 flex items-center gap-3 p-1 rounded-lg text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 shadow-sm">
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold capitalize truncate">
                              {title}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {subtitle}
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleInspector(ann.id)}
                          className="p-2 rounded-lg hover:bg-white/80 transition-colors"
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
                        <div className="px-3 pb-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectorOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#2563EB] border border-[#BFDBFE] hover:bg-blue-100/60 transition-colors"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAnnotation(ann.id)}
                            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 border border-[#E5E7EB] hover:bg-slate-100 transition-colors"
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
              <div className="p-4 border-t border-[#E5E7EB] bg-slate-50 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Edit Annotation
                    </p>
                    <p className="text-sm font-semibold text-slate-700 capitalize mt-1">
                      {selectedAnnotation.kind}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectorOpen(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="Position X"
                      value={selectedAnnotation.x}
                      step={1}
                      onChange={(value) => handleSelectedPositionChange("x", value)}
                    />
                    <NumberField
                      label="Position Y"
                      value={selectedAnnotation.y}
                      step={1}
                      onChange={(value) => handleSelectedPositionChange("y", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Color</span>
                    <div className="flex gap-1.5">
                      {COLORS.map((c) => {
                        const isColorSelected = selectedAnnotation.color === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleSelectedColorChange(c)}
                            className={[
                              "w-4 h-4 rounded-full border border-white ring-1 ring-slate-200 transition-transform hover:scale-125",
                              isColorSelected ? "ring-[#2563EB] ring-2 scale-110" : "",
                            ].join(" ")}
                            style={{ backgroundColor: c }}
                            aria-label={`Set annotation color ${c}`}
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
                          updateAnnotation({
                            id: selectedAnnotation.id,
                            kind: "rectangle",
                            updates: {
                              width: Math.max(1, value),
                              height: selectedAnnotation.height,
                              color: selectedAnnotation.color,
                            },
                          })
                        }
                      />
                      <NumberField
                        label="Height"
                        value={selectedAnnotation.height}
                        min={1}
                        onChange={(value) =>
                          updateAnnotation({
                            id: selectedAnnotation.id,
                            kind: "rectangle",
                            updates: {
                              width: selectedAnnotation.width,
                              height: Math.max(1, value),
                              color: selectedAnnotation.color,
                            },
                          })
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
                        updateAnnotation({
                          id: selectedAnnotation.id,
                          kind: "circle",
                          updates: {
                            radius: Math.max(1, value),
                            color: selectedAnnotation.color,
                          },
                        })
                      }
                    />
                  ) : null}

                  {selectedAnnotation.kind === "line" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField
                        label="End X"
                        value={selectedAnnotation.x + selectedAnnotation.points[2]}
                        onChange={(value) =>
                          updateAnnotation({
                            id: selectedAnnotation.id,
                            kind: "line",
                            updates: {
                              points: [
                                0,
                                0,
                                value - selectedAnnotation.x,
                                selectedAnnotation.points[3],
                              ],
                              color: selectedAnnotation.color,
                            },
                          })
                        }
                      />
                      <NumberField
                        label="End Y"
                        value={selectedAnnotation.y + selectedAnnotation.points[3]}
                        onChange={(value) =>
                          updateAnnotation({
                            id: selectedAnnotation.id,
                            kind: "line",
                            updates: {
                              points: [
                                0,
                                0,
                                selectedAnnotation.points[2],
                                value - selectedAnnotation.y,
                              ],
                              color: selectedAnnotation.color,
                            },
                          })
                        }
                      />
                    </div>
                  ) : null}

                  {selectedAnnotation.kind === "text" ? (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <span className="text-xs text-slate-500">Content</span>
                        <textarea
                          value={selectedAnnotation.text}
                          onChange={(e) => {
                            updateAnnotation({
                              id: selectedAnnotation.id,
                              kind: "text",
                              updates: {
                                text: e.target.value,
                                fontSize: selectedAnnotation.fontSize,
                                color: selectedAnnotation.color,
                              },
                            });
                          }}
                          className="w-full min-h-24 text-sm p-2 rounded-lg border border-[#E5E7EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                        />
                      </div>

                      <NumberField
                        label="Font Size"
                        value={selectedAnnotation.fontSize}
                        min={8}
                        onChange={(value) =>
                          updateAnnotation({
                            id: selectedAnnotation.id,
                            kind: "text",
                            updates: {
                              text: selectedAnnotation.text,
                              fontSize: Math.max(8, value),
                              color: selectedAnnotation.color,
                            },
                          })
                        }
                      />
                    </div>
                  ) : null}

                  {selectedAnnotation.kind !== "text" ? (
                    <div className="rounded-lg border border-dashed border-[#CBD5E1] bg-white/70 px-3 py-2 text-xs text-slate-500">
                      Move with drag, or fine-tune this annotation here using the edit controls above.
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </aside>
      </div>
    </div>
  );
}
