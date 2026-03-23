export const clampNumber = (
  value: number,
  min: number,
  max: number
): number => Math.max(min, Math.min(max, value));

export const createIdFallbackSafe = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ann_${Math.random().toString(16).slice(2)}_${Date.now()}`;
};
