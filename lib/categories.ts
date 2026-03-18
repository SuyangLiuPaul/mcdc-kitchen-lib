export const CATEGORY_ICONS: Record<string, string> = {
  Kitchen: "🍳",
  Cleaning: "🧹",
  Tools: "🔧",
  Other: "📦",
};

export const CATEGORIES = ["Kitchen", "Cleaning", "Tools", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];
