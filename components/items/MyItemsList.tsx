"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import ItemForm from "./ItemForm";

type Item = {
  id: string;
  title: string;
  titleZh: string | null;
  description: string | null;
  descriptionZh: string | null;
  imageUrl: string | null;
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
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + {t("addItem")}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-400 py-20">{t("noItems")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const title = locale === "zh" && item.titleZh ? item.titleZh : item.title;
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <div className="relative w-full h-40 bg-gray-100">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={title} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300 text-4xl">📦</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => { setEditItem(item); setShowForm(true); }}
                      className="flex-1 text-sm border border-gray-300 rounded-lg py-1.5 hover:bg-gray-50"
                    >
                      {t("editItem")}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 text-sm border border-red-200 text-red-600 rounded-lg py-1.5 hover:bg-red-50"
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
