export const COLOR_PALETTE = [
  "#3b82f6",
  "#10b981",
  "#f43f5e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
];

export const COLOR_FALLBACK = COLOR_PALETTE[0] ?? "#3b82f6";

export function getColorForLabel(label: string = ""): string {
  if (!label) {
    return COLOR_FALLBACK;
  }

  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index] ?? COLOR_FALLBACK;
}
