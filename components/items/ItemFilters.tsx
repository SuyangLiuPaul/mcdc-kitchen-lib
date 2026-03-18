"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const CATEGORIES = ["Kitchen", "Cleaning", "Tools", "Other"];

export default function ItemFilters() {
  const t = useTranslations("home");
  const tCat = useTranslations("categories");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(searchParams.get("search") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6">
      {/* Search */}
      <input
        type="text"
        placeholder={t("searchPlaceholder")}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
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
            {tCat(cat as "Kitchen" | "Cleaning" | "Tools" | "Other")}
          </option>
        ))}
      </select>
    </div>
  );
}
