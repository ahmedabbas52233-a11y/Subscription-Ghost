// Central design tokens — import in every page/component
export const C = {
  bg:          "#0c0c10",          // page background
  surface:     "rgba(18,18,26,.9)",// card/panel surface
  surfaceHov:  "rgba(22,22,32,.9)",
  border:      "rgba(255,255,255,.07)",
  borderFocus: "rgba(99,102,241,.5)",

  // Text
  textPrimary:   "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted:     "#64748b",

  // Brand
  indigo:  "#6366f1",
  violet:  "#7c3aed",
  grad:    "linear-gradient(135deg,#4f46e5,#7c3aed)",
  gradGlow:"0 8px 28px -4px rgba(99,102,241,.45)",

  // Semantic
  success: "#4ade80",
  error:   "#f87171",
  errorBg: "rgba(248,113,113,.08)",
  errorBorder: "rgba(248,113,113,.18)",
  warn:    "#fbbf24",
  info:    "#818cf8",
};

export const cardBase = {
  background: C.surface,
  border:     `1px solid ${C.border}`,
  borderRadius: 16,
};
