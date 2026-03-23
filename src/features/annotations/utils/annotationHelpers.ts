import type {
  Annotation,
  AnnotationKind,
  CircleAnnotation,
  LineAnnotation,
  PageSize,
  RectangleAnnotation,
  TextAnnotation,
} from "../types/annotation.types";
import { clampNumber, createIdFallbackSafe } from "./annotationUtils";
import { PRIMARY_COLOR } from "@/utils/constants";

export const ANNOTATIONS_JSON_VERSION = 1;

type ExportedAnnotationsJsonV1 = {
  version: typeof ANNOTATIONS_JSON_VERSION;
  page: PageSize;
  annotations: Annotation[];
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseAnnotationKind = (value: unknown): AnnotationKind | null => {
  if (value === "rectangle") return "rectangle";
  if (value === "circle") return "circle";
  if (value === "line") return "line";
  if (value === "text") return "text";
  return null;
};

const scaleAnnotation = (
  annotation: Annotation,
  scaleX: number,
  scaleY: number
): Annotation => {
  const avgScale = (scaleX + scaleY) / 2;
  switch (annotation.kind) {
    case "rectangle": {
      const a = annotation as RectangleAnnotation;
      return {
        ...a,
        x: a.x * scaleX,
        y: a.y * scaleY,
        width: a.width * scaleX,
        height: a.height * scaleY,
      };
    }
    case "circle": {
      const a = annotation as CircleAnnotation;
      return {
        ...a,
        x: a.x * scaleX,
        y: a.y * scaleY,
        radius: a.radius * avgScale,
      };
    }
    case "line": {
      const a = annotation as LineAnnotation;
      return {
        ...a,
        x: a.x * scaleX,
        y: a.y * scaleY,
        points: a.points.map((p, idx) => {
          const isX = idx % 2 === 0;
          return p * (isX ? scaleX : scaleY);
        }),
      };
    }
    case "text": {
      const a = annotation as TextAnnotation;
      return {
        ...a,
        x: a.x * scaleX,
        y: a.y * scaleY,
        fontSize: a.fontSize * avgScale,
      };
    }
  }
};

const sanitizeNumber = (name: string, value: unknown): number => {
  if (!isFiniteNumber(value)) {
    throw new Error(`Invalid ${name}: expected a number`);
  }
  return value;
};

const sanitizePositive = (name: string, value: unknown): number => {
  const v = sanitizeNumber(name, value);
  if (v < 0) {
    throw new Error(`Invalid ${name}: must be >= 0`);
  }
  return v;
};

const sanitizeId = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return createIdFallbackSafe();
  }
  return value;
};

const sanitizeColor = (value: unknown): string => {
  if (typeof value !== "string") return PRIMARY_COLOR;
  const v = value.trim();
  // Keep it strict for interview-quality payload validation.
  const isHex3 = /^#([0-9a-fA-F]{3})$/.test(v);
  const isHex6 = /^#([0-9a-fA-F]{6})$/.test(v);
  return isHex3 || isHex6 ? v : PRIMARY_COLOR;
};

export const exportAnnotationsToJson = (
  annotations: Annotation[],
  pageSize: PageSize
): string => {
  const payload: ExportedAnnotationsJsonV1 = {
    version: ANNOTATIONS_JSON_VERSION,
    page: {
      width: pageSize.width,
      height: pageSize.height,
    },
    annotations,
  };

  return JSON.stringify(payload, null, 2);
};

export const importAnnotationsFromJson = (
  json: string,
  currentPageSize: PageSize
): Annotation[] => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    throw new Error("Invalid JSON. Please paste a valid annotations payload.");
  }

  // Accept either the full exported payload or a raw annotations array.
  if (Array.isArray(parsed)) {
    const annotations = parseAnnotationsArray(parsed);
    // If no page info is provided, we assume the coordinates are already in current canvas space.
    return annotations;
  }

  if (!isRecord(parsed)) {
    throw new Error("Invalid payload format. Expected an annotations array or an exported payload object.");
  }

  const version = parsed.version;
  if (version !== ANNOTATIONS_JSON_VERSION) {
    throw new Error(`Unsupported annotations payload version: ${String(version)}`);
  }

  if (!isRecord(parsed.page)) {
    throw new Error("Invalid payload: missing `page` object.");
  }

  const exportedWidth = sanitizePositive("page.width", (parsed.page as { width?: unknown }).width);
  const exportedHeight = sanitizePositive("page.height", (parsed.page as { height?: unknown }).height);

  const scaleX = currentPageSize.width / exportedWidth;
  const scaleY = currentPageSize.height / exportedHeight;

  const annotationsUnknown = (parsed as { annotations?: unknown }).annotations;
  if (!Array.isArray(annotationsUnknown)) {
    throw new Error("Invalid payload: missing `annotations` array.");
  }

  const annotations = parseAnnotationsArray(annotationsUnknown);
  return annotations.map((a) => scaleAnnotation(a, scaleX, scaleY));
};

const parseAnnotationsArray = (value: unknown[]): Annotation[] =>
  value.map((raw) => parseSingleAnnotation(raw));

const parseSingleAnnotation = (raw: unknown): Annotation => {
  if (!isRecord(raw)) {
    throw new Error("Invalid annotation: expected an object.");
  }

  const kind = parseAnnotationKind(raw.kind);
  if (kind === null) {
    throw new Error("Invalid annotation: missing or unknown `kind`.");
  }

  const id = sanitizeId(raw.id);
  const x = sanitizeNumber("x", raw.x);
  const y = sanitizeNumber("y", raw.y);

  switch (kind) {
    case "rectangle": {
      const width = sanitizePositive("width", raw.width);
      const height = sanitizePositive("height", raw.height);
      return {
        id,
        kind,
        x: clampNumber(x, 0, 1_000_000),
        y: clampNumber(y, 0, 1_000_000),
        width,
        height,
        color: sanitizeColor(raw.color),
      };
    }
    case "circle": {
      const radius = sanitizePositive("radius", raw.radius);
      return {
        id,
        kind,
        x: clampNumber(x, 0, 1_000_000),
        y: clampNumber(y, 0, 1_000_000),
        radius,
        color: sanitizeColor(raw.color),
      };
    }
    case "line": {
      const pointsUnknown = raw.points;
      if (!Array.isArray(pointsUnknown)) {
        throw new Error("Invalid line annotation: expected `points` array.");
      }
      const points = pointsUnknown.map((p) => sanitizeNumber("points[]", p));
      if (points.length < 4 || points.length % 2 !== 0) {
        throw new Error("Invalid line annotation: `points` must have an even length >= 4.");
      }
      return {
        id,
        kind,
        x: clampNumber(x, 0, 1_000_000),
        y: clampNumber(y, 0, 1_000_000),
        points,
        color: sanitizeColor(raw.color),
      };
    }
    case "text": {
      const text = typeof raw.text === "string" ? raw.text : "";
      const fontSize =
        isFiniteNumber(raw.fontSize) && raw.fontSize > 0 ? raw.fontSize : 16;
      return {
        id,
        kind,
        x: clampNumber(x, 0, 1_000_000),
        y: clampNumber(y, 0, 1_000_000),
        text,
        fontSize,
        color: sanitizeColor(raw.color),
      };
    }
  }
};
