export const PRIMARY_COLOR = "#2563EB";
export const ANNOTATION_CORNER_RADIUS = 8;

export const COLORS = ["#2563EB", "#EF4444", "#10B981", "#8B5CF6", "#111827"];

const parseHexColor = (
  hex: string
): { r: number; g: number; b: number } | null => {
  const v = hex.trim();
  const isHex3 = /^#([0-9a-fA-F]{3})$/.test(v);
  const isHex6 = /^#([0-9a-fA-F]{6})$/.test(v);
  if (!isHex3 && !isHex6) return null;

  const normalized = isHex3
    ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`
    : v;

  const r = Number.parseInt(normalized.slice(1, 3), 16);
  const g = Number.parseInt(normalized.slice(3, 5), 16);
  const b = Number.parseInt(normalized.slice(5, 7), 16);

  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
    return null;
  }

  return { r, g, b };
};

export const hexToRgba = (hex: string, alpha: number): string => {
  const rgb = parseHexColor(hex);
  if (!rgb) return `rgba(37, 99, 235, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};
