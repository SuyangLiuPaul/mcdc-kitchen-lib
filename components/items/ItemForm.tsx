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
  imageUrls: string[];
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
  const tCat = useTranslations("categories");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(item?.imageUrls ?? []);
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

  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = { ...formData, imageUrls };
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

  const canUploadMore = imageUrls.length < 4;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {item ? t("editItem") : t("addItem")}
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
                    {tCat(c as "Kitchen" | "Cleaning" | "Tools" | "Other")}
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
                <option value="AVAILABLE">{t("statusAvailable")}</option>
                <option value="BORROWED">{t("statusBorrowed")}</option>
              </select>
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              {t("image")}{" "}
              <span className="text-gray-400 font-normal">
                ({imageUrls.length}/4)
              </span>
            </label>

            {/* Uploaded image previews */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {imageUrls.map((url, i) => (
                  <div key={url} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none transition-colors"
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                        {t("mainPhoto")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload dropzone — only shown when under the 4-photo limit */}
            {canUploadMore && (
              <div className="relative">
                <UploadDropzone<OurFileRouter, "itemImage">
                  endpoint="itemImage"
                  onUploadBegin={() => setUploading(true)}
                  onClientUploadComplete={(res) => {
                    setUploading(false);
                    const newUrls = res
                      .map((f) => f.ufsUrl ?? f.url)
                      .filter(Boolean) as string[];
                    setImageUrls((prev) => [...prev, ...newUrls].slice(0, 4));
                  }}
                  onUploadError={(error) => {
                    setUploading(false);
                    alert("Upload failed: " + error.message);
                  }}
                  className="ut-label:text-sm ut-label:font-medium ut-label:text-gray-700 ut-allowed-content:text-xs ut-allowed-content:text-gray-400 ut-button:bg-indigo-600 ut-button:hover:bg-indigo-700 border-2 border-dashed border-gray-300 rounded-xl"
                />

                {/* Loading overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 rounded-xl flex flex-col items-center justify-center gap-2 z-10">
                    <svg
                      className="animate-spin h-8 w-8 text-indigo-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span className="text-sm text-indigo-700 font-medium">
                      {t("uploading")}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? t("saving") : t("save")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
