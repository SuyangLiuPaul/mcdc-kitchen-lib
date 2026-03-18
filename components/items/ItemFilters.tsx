"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES = ["Kitchen", "Cleaning", "Tools", "Other"];

export default function ItemFilters() {
  const t = useTranslations("home");
  const tCat = useTranslations("categories");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6">
      {/* Search */}
      <input
        type="text"
        placeholder={t("searchPlaceholder")}
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => {
          const qs = createQueryString({
            search: e.target.value || null,
          });
          router.push(`${pathname}?${qs}`);
        }}
        className="flex-1 border border-gray-200 rounded-xl px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
      />

      {/* Category */}
      <select
        defaultValue={searchParams.get("category") ?? "all"}
        onChange={(e) => {
          const qs = createQueryString({
            category: e.target.value === "all" ? null : e.target.value,
          });
          router.push(`${pathname}?${qs}`);
        }}
        className="border border-gray-200 rounded-xl px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm bg-white"
      >
        <option value="all">{t("allCategories")}</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {tCat(cat as keyof typeof tCat)}
          </option>
        ))}
      </select>
    </div>
  );
}
