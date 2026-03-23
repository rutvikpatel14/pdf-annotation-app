"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FileText, Upload, X } from "lucide-react";
import type {
  Annotation,
  AnnotationMovePayload,
  AnnotationTool,
  PageSize,
  UpdateAnnotationPayload,
} from "@/features/annotations/types/annotation.types";
import { AnnotationLayer } from "../AnnotationLayer/AnnotationLayer";

type PdfViewerProps = {
  tool: AnnotationTool;
  onToolChange?: (tool: AnnotationTool) => void;
  annotations: Annotation[];
  selectedId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onAddAnnotation: (annotation: Annotation) => void;
  onUpdateAnnotation: (payload: UpdateAnnotationPayload) => void;
  onMoveAnnotation: (payload: AnnotationMovePayload) => void;
  onStageSizeChange: (size: PageSize | null) => void;
  zoom: number;
};

function safeIsPdf(file: File): boolean {
  const nameOk = file.name.toLowerCase().endsWith(".pdf");
  const typeOk = file.type === "application/pdf" || file.type === "application/x-pdf";
  return nameOk || typeOk;
}

export function PdfViewer({
  tool,
  onToolChange,
  annotations,
  selectedId,
  onSelectAnnotation,
  onAddAnnotation,
  onUpdateAnnotation,
  onMoveAnnotation,
  onStageSizeChange,
  zoom,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [baseWidth, setBaseWidth] = useState<number>(720);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pageAspect, setPageAspect] = useState<number | null>(null);

  useEffect(() => {
    // Use the locally bundled PDF.js worker.
    // This avoids environments where outbound CDN requests are blocked.
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      const max = 900;
      const width = el.getBoundingClientRect().width;
      const nextWidth = Math.max(320, Math.min(max, width));
      setBaseWidth(nextWidth);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const renderWidth = useMemo(() => {
    const clampedZoom = Math.max(25, Math.min(400, zoom));
    return baseWidth * (clampedZoom / 100);
  }, [baseWidth, zoom]);

  const stageSize = useMemo<PageSize | null>(() => {
    if (pageAspect === null) return null;
    return {
      width: renderWidth,
      height: renderWidth * pageAspect,
    };
  }, [pageAspect, renderWidth]);

  useEffect(() => {
    onStageSizeChange(stageSize);
  }, [onStageSizeChange, stageSize]);

  const handleFileChange = (file: File | null) => {
    setPdfError(null);
    setPageAspect(null);

    if (!file) {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
      setPdfName(null);
      return;
    }

    if (!safeIsPdf(file)) {
      setPdfError("Invalid file. Please upload a PDF document.");
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setPdfName(file.name);
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return nextUrl;
    });
  };

  const pdfDocument = useMemo(() => pdfUrl, [pdfUrl]);
  const uploadInputId = "pdf-upload";

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-start px-4 py-6">
      <div className="w-full max-w-5xl">
        <input
          id={uploadInputId}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            handleFileChange(file);
          }}
        />

        <div
          ref={containerRef}
          className={[
            "relative flex justify-center",
            pdfDocument ? "mt-6 items-start" : "min-h-[70vh] items-center",
          ].join(" ")}
          style={{ width: "100%" }}
        >
          {!pdfDocument ? (
            <div className="flex w-full flex-1 items-center justify-center">
              <button
                type="button"
                onClick={() => document.getElementById(uploadInputId)?.click()}
                className="group flex w-full max-w-md flex-col items-center gap-6 rounded-[28px] border-2 border-dashed border-slate-300 bg-white px-10 py-14 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-[#2563EB] hover:shadow-[0_28px_80px_rgba(37,99,235,0.12)]"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] transition-transform group-hover:scale-110">
                  <Upload size={32} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-800">
                    Upload your PDF
                  </h2>
                  <p className="text-sm text-slate-500">
                    Drag and drop your file here, or click to browse.
                  </p>
                </div>
                <span className="rounded-xl bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition-colors group-hover:bg-[#1D4ED8]">
                  Select File
                </span>
                {pdfError ? (
                  <span className="text-sm font-medium text-rose-600">
                    {pdfError}
                  </span>
                ) : null}
              </button>
            </div>
          ) : (
            <div className="w-full">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
                <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200">
                  <FileText size={14} />
                  <span className="max-w-[280px] truncate text-slate-700">
                    {pdfName ?? "Uploaded PDF"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleFileChange(null)}
                    className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Remove uploaded PDF"
                  >
                    <X size={14} />
                  </button>
                </div>
                {pdfError ? (
                  <span className="text-sm font-medium text-rose-600">
                    {pdfError}
                  </span>
                ) : null}
              </div>

              <div
                className="relative mx-auto"
                style={{
                  width: stageSize ? stageSize.width : renderWidth,
                  height: stageSize ? stageSize.height : 540,
                }}
              >
                <Document
                  file={pdfDocument}
                  onLoadError={(err) => {
                    setPdfError(
                      err instanceof Error ? err.message : "Failed to load PDF."
                    );
                  }}
                  loading={<div className="py-10 text-center">Loading PDF...</div>}
                >
                  <Page
                    pageNumber={1}
                    width={renderWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    onLoadSuccess={(page) => {
                      const { width, height } = page;
                      const aspect = height / width;
                      setPageAspect(aspect);
                    }}
                  />
                </Document>

                {stageSize ? (
                  <div className="absolute inset-0">
                    <AnnotationLayer
                      pageSize={stageSize}
                      tool={tool}
                      onToolChange={onToolChange}
                      annotations={annotations}
                      selectedId={selectedId}
                      onSelectAnnotation={onSelectAnnotation}
                      onAddAnnotation={onAddAnnotation}
                      onUpdateAnnotation={onUpdateAnnotation}
                      onMoveAnnotation={onMoveAnnotation}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
