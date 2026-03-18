"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { UploadButton } from "@uploadthing/react";
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

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t("image")}
            </label>
            <p className="text-xs text-gray-400 mb-2">{t("imageHint")}</p>

            {imageUrl ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 mb-2">
                <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md hover:bg-black/80"
                >
                  Remove
                </button>
              </div>
            ) : (
              <UploadButton<OurFileRouter, "itemImage">
                endpoint="itemImage"
                onUploadBegin={() => setUploading(true)}
                onClientUploadComplete={(res) => {
                  setUploading(false);
                  // ufsUrl is the v7 field; fall back to url for compatibility
                  const uploaded = res?.[0];
                  const url = uploaded?.ufsUrl ?? uploaded?.url;
                  if (url) setImageUrl(url);
                }}
                onUploadError={(error) => {
                  setUploading(false);
                  console.error("Upload error:", error);
                }}
              />
            )}

            {uploading && (
              <p className="text-xs text-indigo-500 mt-1">Uploading...</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? t("saving") : t("save")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
