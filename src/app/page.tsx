"use client";

import { useMemo, useState } from "react";
import { AnnotationsSidebar } from "@/components/AnnotationsSidebar/AnnotationsSidebar";
import Toolbar from "@/components/Toolbar/Toolbar";
import { PdfViewer } from "@/components/PdfViewer/PdfViewer";
import { useAnnotations } from "@/features/annotations/hooks/useAnnotations";
import type {
  AnnotationTool,
  PageSize,
} from "@/features/annotations/types/annotation.types";

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

  const handleToggleInspector = (id: string) => {
    if (selectedId !== id) {
      selectAnnotation(id);
      setInspectorOpen(true);
      return;
    }

    setInspectorOpen((prev) => !prev);
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
    <div className="flex h-screen flex-col overflow-hidden bg-app-bg">
      <Toolbar
        tool={tool}
        onToolChange={setTool}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="min-w-0 flex-1 overflow-y-auto">
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

        <AnnotationsSidebar
          annotations={annotations}
          selectedId={selectedId}
          inspectorOpen={inspectorOpen}
          onSelectAnnotation={selectAnnotation}
          onToggleInspector={handleToggleInspector}
          onOpenInspector={() => setInspectorOpen(true)}
          onCloseInspector={() => setInspectorOpen(false)}
          onDeleteAnnotation={deleteAnnotation}
          onMoveAnnotation={(id, x, y) => moveAnnotation({ id, x, y })}
          onSetAnnotationColor={handleSelectedColorChange}
          onUpdateRectangle={(width, height, color) => {
            if (!selectedAnnotation || selectedAnnotation.kind !== "rectangle") {
              return;
            }
            updateAnnotation({
              id: selectedAnnotation.id,
              kind: "rectangle",
              updates: { width, height, color },
            });
          }}
          onUpdateCircle={(radius, color) => {
            if (!selectedAnnotation || selectedAnnotation.kind !== "circle") {
              return;
            }
            updateAnnotation({
              id: selectedAnnotation.id,
              kind: "circle",
              updates: { radius, color },
            });
          }}
          onUpdateLine={(endX, endY, color) => {
            if (!selectedAnnotation || selectedAnnotation.kind !== "line") {
              return;
            }
            updateAnnotation({
              id: selectedAnnotation.id,
              kind: "line",
              updates: {
                points: [
                  0,
                  0,
                  endX - selectedAnnotation.x,
                  endY - selectedAnnotation.y,
                ],
                color,
              },
            });
          }}
          onUpdateText={(text, fontSize, color) => {
            if (!selectedAnnotation || selectedAnnotation.kind !== "text") {
              return;
            }
            updateAnnotation({
              id: selectedAnnotation.id,
              kind: "text",
              updates: { text, fontSize, color },
            });
          }}
        />
      </div>
    </div>
  );
}

