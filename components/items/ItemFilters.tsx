"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

export default function ItemFilters({ total }: { total: number }) {
  const t = useTranslations("home");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(searchParams.get("search") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const hasFilters = !!searchValue;

  return (
    <div className="mt-6 space-y-3">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
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
