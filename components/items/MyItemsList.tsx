"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import ItemForm from "./ItemForm";
import { CATEGORY_ICONS, type Category } from "@/lib/categories";

type Item = {
  id: string;
  title: string;
  titleZh: string | null;
  description: string | null;
  descriptionZh: string | null;
  imageUrls: string[];
  category: string | null;
  status: string;
};

export default function MyItemsList({
  items,
  locale,
}: {
  items: Item[];
  locale: string;
}) {
  const t = useTranslations("myItems");
  const tCat = useTranslations("categories");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Auto-open add form when ?add=1 is in the URL (from Navbar)
  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setEditItem(null);
      setShowForm(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("add");
      router.replace(url.pathname + (url.search || ""), { scroll: false });
    }
  }, [searchParams, router]);

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleToggleStatus(id: string) {
    setTogglingId(id);
    await fetch(`/api/items/${id}`, { method: "PATCH" });
    setTogglingId(null);
    router.refresh();
  }

  function openAddForm() {
    setEditItem(null);
    setShowForm(true);
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={openAddForm}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 font-medium transition-colors"
        >
          + {t("addItem")}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-400 mb-6">{t("noItems")}</p>
          <button
            onClick={openAddForm}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-indigo-700 font-medium transition-colors"
          >
            + {t("addItem")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const title = locale === "zh" && item.titleZh ? item.titleZh : item.title;
            const categoryLabel = item.category
              ? tCat(item.category as Category)
              : null;
            const categoryIcon = item.category ? CATEGORY_ICONS[item.category] : null;
            const isAvailable = item.status === "AVAILABLE";
            const isToggling = togglingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative w-full h-40 bg-gray-100">
                  {item.imageUrls[0] ? (
                    <Image src={item.imageUrls[0]} alt={title} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300 text-4xl">
                      {categoryIcon ?? "📦"}
                    </div>
                  )}
                  {/* Status badge */}
                  <span
                    className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isAvailable
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isAvailable ? t("statusAvailable") : t("statusBorrowed")}
                  </span>
                  {/* Photo count badge */}
                  {item.imageUrls.length > 1 && (
                    <span className="absolute top-2 right-2 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded font-medium">
                      📷 {item.imageUrls.length}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
                  {categoryLabel && (
                    <span className="inline-block mt-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                      {categoryIcon} {categoryLabel}
                    </span>
                  )}

                  {/* Quick status toggle */}
                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    disabled={isToggling}
                    className={`w-full mt-3 text-xs py-1.5 rounded-lg font-medium border transition-colors disabled:opacity-50 ${
                      isAvailable
                        ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                        : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {isToggling
                      ? "..."
                      : isAvailable
                      ? t("markBorrowed")
                      : t("markAvailable")}
                  </button>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => { setEditItem(item); setShowForm(true); }}
                      className="flex-1 text-sm border border-gray-300 rounded-lg py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      {t("editItem")}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 text-sm border border-red-200 text-red-600 rounded-lg py-1.5 hover:bg-red-50 transition-colors"
                    >
                      {t("deleteItem")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <ItemForm
          item={editItem}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); router.refresh(); }}
        />
      )}
    </>
  );
}
