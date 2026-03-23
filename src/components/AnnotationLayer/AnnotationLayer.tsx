"use client";

import { Circle, Layer, Line, Rect, Stage } from "react-konva";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import type {
  Annotation,
  AnnotationMovePayload,
  AnnotationTool,
  PageSize,
  UpdateAnnotationPayload,
} from "@/features/annotations/types/annotation.types";
import { useDrag } from "@/hooks/useDrag";
import {
  clampNumber,
  createIdFallbackSafe,
} from "@/features/annotations/utils/annotationUtils";
import { PRIMARY_COLOR } from "@/utils/constants";
import { AnnotationItem } from "../AnnotationItem/AnnotationItem";

type AnnotationLayerProps = {
  pageSize: PageSize;
  tool: AnnotationTool;
  annotations: Annotation[];
  selectedId: string | null;
  onToolChange?: (tool: AnnotationTool) => void;
  onSelectAnnotation: (id: string | null) => void;
  onAddAnnotation: (annotation: Annotation) => void;
  onUpdateAnnotation: (payload: UpdateAnnotationPayload) => void;
  onMoveAnnotation: (payload: AnnotationMovePayload) => void;
};

type Draft =
  | {
      kind: "rectangle";
      startX: number;
      startY: number;
      currentX: number;
      currentY: number;
    }
  | {
      kind: "circle";
      startX: number;
      startY: number;
      currentX: number;
      currentY: number;
    }
  | {
      kind: "line";
      startX: number;
      startY: number;
      currentX: number;
      currentY: number;
    };

type TextEditingState = {
  id: string;
  value: string;
  fontSize: number;
  x: number;
  y: number;
  color: string;
};

export const AnnotationLayer = ({
  pageSize,
  tool,
  annotations,
  selectedId,
  onToolChange,
  onSelectAnnotation,
  onAddAnnotation,
  onUpdateAnnotation,
  onMoveAnnotation,
}: AnnotationLayerProps) => {
  const stageRef = useRef<KonvaStage | null>(null);
  const { getPointerPosition } = useDrag(stageRef);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<TextEditingState | null>(
    null
  );
  const textareaRef = useRef<HTMLInputElement | null>(null);
  const editingId = editing?.id ?? null;
  const editingAnnotation = useMemo(() => {
    if (!editing) return null;
    return annotations.find((a) => a.id === editing.id) ?? null;
  }, [annotations, editing]);

  useEffect(() => {
    if (!editingId) return;
    const el = textareaRef.current;
    if (!el) return;

    el.focus();
    const cursorPosition = el.value.length;
    el.setSelectionRange(cursorPosition, cursorPosition);
  }, [editingId]);

  const commitTextEditing = () => {
    if (!editing) return;

    const nextText = editing.value.trim();

    if (editingAnnotation) {
      onUpdateAnnotation({
        id: editing.id,
        kind: "text",
        updates: {
          text: nextText,
          fontSize: editing.fontSize,
          color: editing.color,
        },
      });
    } else if (nextText.length > 0) {
      onAddAnnotation({
        id: editing.id,
        kind: "text",
        x: editing.x,
        y: editing.y,
        text: nextText,
        fontSize: editing.fontSize,
        color: editing.color,
      });
      onSelectAnnotation(editing.id);
    }

    setEditing(null);
  };

  const cancelTextEditing = () => {
    setEditing(null);
  };

  const cursor = useMemo(() => {
    if (editing) return "text";
    if (tool === "select") return "default";
    if (tool === "text") return "text";
    return "crosshair";
  }, [editing, tool]);

  const beginDraft = (kind: "rectangle" | "circle" | "line", x: number, y: number) => {
    if (kind === "rectangle") {
      setDraft({ kind, startX: x, startY: y, currentX: x, currentY: y });
      return;
    }
    if (kind === "circle") {
      setDraft({ kind, startX: x, startY: y, currentX: x, currentY: y });
      return;
    }
    setDraft({ kind, startX: x, startY: y, currentX: x, currentY: y });
  };

  const updateDraft = (x: number, y: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, currentX: x, currentY: y };
    });
  };

  const finalizeDraft = () => {
    if (!draft) return;

    const { width, height } = pageSize;

    if (draft.kind === "rectangle") {
      const left = clampNumber(Math.min(draft.startX, draft.currentX), 0, width);
      const top = clampNumber(Math.min(draft.startY, draft.currentY), 0, height);
      const right = clampNumber(Math.max(draft.startX, draft.currentX), 0, width);
      const bottom = clampNumber(Math.max(draft.startY, draft.currentY), 0, height);
      const rectWidth = right - left;
      const rectHeight = bottom - top;

      if (rectWidth < 6 || rectHeight < 6) {
        setDraft(null);
        return;
      }

      const newId = createIdFallbackSafe();
      onAddAnnotation({
        id: newId,
        kind: "rectangle",
        x: left,
        y: top,
        width: rectWidth,
        height: rectHeight,
        color: PRIMARY_COLOR,
      });
    }

    if (draft.kind === "circle") {
      const startX = clampNumber(draft.startX, 0, width);
      const startY = clampNumber(draft.startY, 0, height);
      const currentX = clampNumber(draft.currentX, 0, width);
      const currentY = clampNumber(draft.currentY, 0, height);

      const centerX = (startX + currentX) / 2;
      const centerY = (startY + currentY) / 2;
      const dx = currentX - startX;
      const dy = currentY - startY;
      const radius = Math.sqrt(dx * dx + dy * dy) / 2;

      const maxRadius = Math.max(
        0,
        Math.min(centerX, width - centerX, centerY, height - centerY)
      );
      const finalRadius = Math.min(radius, maxRadius);

      if (finalRadius < 6) {
        setDraft(null);
        return;
      }

      onAddAnnotation({
        id: createIdFallbackSafe(),
        kind: "circle",
        x: centerX,
        y: centerY,
        radius: finalRadius,
        color: PRIMARY_COLOR,
      });
    }

    if (draft.kind === "line") {
      const startX = clampNumber(draft.startX, 0, width);
      const startY = clampNumber(draft.startY, 0, height);
      const endX = clampNumber(draft.currentX, 0, width);
      const endY = clampNumber(draft.currentY, 0, height);

      const dx = endX - startX;
      const dy = endY - startY;

      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) {
        setDraft(null);
        return;
      }

      onAddAnnotation({
        id: createIdFallbackSafe(),
        kind: "line",
        x: startX,
        y: startY,
        points: [0, 0, dx, dy],
        color: PRIMARY_COLOR,
      });
    }

    setDraft(null);
  };

  const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (editing) return;
    if (tool === "select") return;
    if (e.target !== e.currentTarget) return;

    const pos = getPointerPosition();
    if (!pos) return;

    if (tool === "rectangle" || tool === "circle" || tool === "line") {
      beginDraft(tool, pos.x, pos.y);
    } else if (tool === "text") {
      const newId = createIdFallbackSafe();
      const x = clampNumber(pos.x, 0, pageSize.width - 1);
      const y = clampNumber(pos.y, 0, pageSize.height - 1);
      setEditing({
        id: newId,
        value: "",
        fontSize: 18,
        x,
        y,
        color: PRIMARY_COLOR,
      });
      onToolChange?.("select");
    }
  };

  const handleStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (editing) return;
    if (!draft) return;
    if (tool === "select") return;
    if (e.target !== e.currentTarget && !draft) return;
    const pos = getPointerPosition();
    if (!pos) return;
    updateDraft(pos.x, pos.y);
  };

  const handleStageMouseUp = () => {
    if (editing) return;
    if (!draft) return;
    if (tool === "select") return;
    finalizeDraft();
  };

  const draftPreview = useMemo(() => {
    if (!draft) return null;
    if (draft.kind === "rectangle") {
      const left = Math.min(draft.startX, draft.currentX);
      const top = Math.min(draft.startY, draft.currentY);
      const width = Math.abs(draft.currentX - draft.startX);
      const height = Math.abs(draft.currentY - draft.startY);
      return (
        <Rect
          x={left}
          y={top}
          width={width}
          height={height}
          cornerRadius={8}
          stroke={PRIMARY_COLOR}
          strokeWidth={2}
          fill="rgba(37, 99, 235, 0.10)"
          dash={[8, 4]}
        />
      );
    }
    if (draft.kind === "circle") {
      const centerX = (draft.startX + draft.currentX) / 2;
      const centerY = (draft.startY + draft.currentY) / 2;
      const dx = draft.currentX - draft.startX;
      const dy = draft.currentY - draft.startY;
      const radius = Math.sqrt(dx * dx + dy * dy) / 2;
      return (
        <Circle
          x={centerX}
          y={centerY}
          radius={radius}
          stroke={PRIMARY_COLOR}
          strokeWidth={2}
          dash={[8, 4]}
        />
      );
    }
    if (draft.kind === "line") {
      const dx = draft.currentX - draft.startX;
      const dy = draft.currentY - draft.startY;
      return (
        <Line
          x={draft.startX}
          y={draft.startY}
          points={[0, 0, dx, dy]}
          stroke={PRIMARY_COLOR}
          strokeWidth={2}
          dash={[8, 4]}
        />
      );
    }
    return null;
  }, [draft]);

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (editing) return;
    if (tool !== "select") return;

    // Background clicks have `target === currentTarget` (stage itself).
    if (e.target === e.currentTarget) {
      onSelectAnnotation(null);
    }
  };

  return (
    <div className="relative w-full h-full">
      <Stage
        width={pageSize.width}
        height={pageSize.height}
        ref={stageRef}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
        style={{ cursor }}
      >
        <Layer>
          {annotations.map((annotation) => (
            <AnnotationItem
              key={annotation.id}
              annotation={annotation}
              isSelected={annotation.id === selectedId}
              tool={tool}
              onSelect={(id) => {
                if (editing) return;
                onSelectAnnotation(id);
              }}
              onMove={(payload) => onMoveAnnotation(payload)}
              onRequestEditText={(id) => {
                const a = annotations.find((x) => x.id === id);
                if (!a || a.kind !== "text") return;
                setEditing({
                  id,
                  value: a.text,
                  fontSize: a.fontSize,
                  x: a.x,
                  y: a.y,
                  color: a.color,
                });
              }}
            />
          ))}

          {draftPreview}
        </Layer>
      </Stage>

      {editing ? (
        <div
          style={{
            position: "absolute",
            left: editing.x,
            top: editing.y,
            width: 340,
            zIndex: 20,
          }}
          className="rounded-xl border border-brand-soft-strong bg-app-surface/95 p-2 shadow-[0_8px_24px_rgba(17,24,39,0.15)]"
        >
          <input
          ref={textareaRef}
          value={editing.value}
          placeholder="Type your text here"
          onChange={(ev) => {
            const nextValue = ev.target.value;
            setEditing((prev) => (prev ? { ...prev, value: nextValue } : prev));
          }}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              ev.preventDefault();
              commitTextEditing();
              return;
            }

            if (ev.key === "Escape") {
              cancelTextEditing();
            }
          }}
          style={{
            width: "100%",
            height: 40,
            borderRadius: 8,
            border: `2px solid ${editing.color}`,
            padding: "0 12px",
            background: "rgba(255,255,255,0.95)",
            color: "var(--app-text)",
            fontSize: editing.fontSize,
            outline: "none",
          }}
        />
          <div className="flex items-center justify-between gap-2 px-1 pt-2">
            <div className="text-[11px] text-slate-500">
              Confirm to add this text to the canvas.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelTextEditing}
                className="rounded-lg border border-app-border px-3 py-1.5 text-xs font-medium text-app-text-muted hover:bg-app-surface-soft"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={commitTextEditing}
                className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
