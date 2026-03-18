"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORIES, CATEGORY_ICONS, type Category } from "@/lib/categories";
import { Search } from "lucide-react";

export default function ItemFilters({ total }: { total: number }) {
  const t = useTranslations("home");
  const tCat = useTranslations("categories");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(searchParams.get("search") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync if the URL changes externally
  useEffect(() => {
    setSearchValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) params.delete(key);
        else params.set(key, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const qs = createQueryString({ search: searchValue || null });
      router.push(`${pathname}?${qs}`);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchValue, pathname, createQueryString, router]);

  // Controlled value (fixes defaultValue bug where select ignores URL state)
  const activeCategory = searchParams.get("category") ?? "all";
  const hasFilters = searchValue || activeCategory !== "all";

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search with icon */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Category — fully controlled so it reflects URL on direct navigation */}
        <select
          value={activeCategory}
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
              {CATEGORY_ICONS[cat]} {tCat(cat as Category)}
            </option>
          ))}
        </select>
      </div>

      {/* Result count + clear filters */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {t("itemCount", { count: total })}
        </p>
        {hasFilters && (
          <button
            onClick={() => {
              setSearchValue("");
              router.push(pathname);
            }}
            className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
          >
            {t("clearFilters")}
          </button>
        )}
      </div>
    </div>
  );
}
