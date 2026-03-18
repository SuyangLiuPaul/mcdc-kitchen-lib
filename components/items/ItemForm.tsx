"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

const CATEGORIES = ["Kitchen", "Cleaning", "Tools", "Other"];

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

export default function ItemForm({
  item,
  onClose,
  onSaved,
}: {
  item?: Item | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations("itemForm");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [formData, setFormData] = useState({
    title: item?.title ?? "",
    titleZh: item?.titleZh ?? "",
    description: item?.description ?? "",
    descriptionZh: item?.descriptionZh ?? "",
    category: item?.category ?? "Kitchen",
    status: item?.status ?? "AVAILABLE",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = { ...formData, imageUrl };
    const url = item ? `/api/items/${item.id}` : "/api/items";
    const method = item ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {item ? t("editItem" as never) ?? "Edit Item" : t("addItem" as never) ?? "Add Item"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t("titleEn")} *
              </label>
              <input
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t("titleZh")}
              </label>
              <input
                name="titleZh"
                value={formData.titleZh}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t("descriptionEn")}
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t("descriptionZh")}
              </label>
              <textarea
                name="descriptionZh"
                rows={3}
                value={formData.descriptionZh}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t("category")}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t("status")}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="AVAILABLE">Available</option>
                <option value="BORROWED">Borrowed</option>
              </select>
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              {t("image")} <span className="text-gray-400 font-normal">(optional)</span>
            </label>

            {imageUrl ? (
              /* Preview after upload */
              <div className="rounded-xl overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-44 object-cover"
                />
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                  <span className="text-xs text-emerald-600 font-medium">✓ Photo ready</span>
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove & re-upload
                  </button>
                </div>
              </div>
            ) : (
              <UploadDropzone<OurFileRouter, "itemImage">
                endpoint="itemImage"
                onUploadBegin={() => setUploading(true)}
                onClientUploadComplete={(res) => {
                  setUploading(false);
                  const uploaded = res?.[0];
                  const url = uploaded?.ufsUrl ?? uploaded?.url;
                  if (url) setImageUrl(url);
                }}
                onUploadError={(error) => {
                  setUploading(false);
                  console.error("Upload error:", error);
                  alert("Upload failed: " + error.message);
                }}
                className="ut-label:text-sm ut-label:font-medium ut-label:text-gray-700 ut-allowed-content:text-xs ut-allowed-content:text-gray-400 ut-button:bg-indigo-600 ut-button:hover:bg-indigo-700 border-2 border-dashed border-gray-300 rounded-xl"
              />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? t("saving") : t("save")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
