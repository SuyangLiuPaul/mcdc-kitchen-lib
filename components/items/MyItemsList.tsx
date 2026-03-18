"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import ItemForm from "./ItemForm";

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

  // Auto-open the add form when ?add=1 is in the URL (from Navbar "+ Add Item")
  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setEditItem(null);
      setShowForm(true);
      // Remove the query param without reloading
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const title = locale === "zh" && item.titleZh ? item.titleZh : item.title;
            const categoryLabel = item.category
              ? tCat(item.category as "Kitchen" | "Cleaning" | "Tools" | "Other")
              : null;
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <div className="relative w-full h-40 bg-gray-100">
                  {item.imageUrls[0] ? (
                    <Image src={item.imageUrls[0]} alt={title} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300 text-4xl">📦</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
                  {categoryLabel && (
                    <span className="inline-block mt-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                      {categoryLabel}
                    </span>
                  )}
                  <div className="flex gap-2 mt-3">
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
