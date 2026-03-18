"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useUploadThing } from "@/lib/uploadthing-client";
import { CATEGORIES, CATEGORY_ICONS, type Category } from "@/lib/categories";

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

  // All state declared first so effects can safely reference them
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(item?.imageUrls ?? []);
  const [formData, setFormData] = useState({
    title: item?.title ?? "",
    titleZh: item?.titleZh ?? "",
    description: item?.description ?? "",
    descriptionZh: item?.descriptionZh ?? "",
    category: item?.category ?? "Kitchen",
    status: item?.status ?? "AVAILABLE",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("itemImage", {
    onUploadProgress: (p) => setUploadProgress(p),
    onClientUploadComplete: (res) => {
      setUploading(false);
      setUploadProgress(0);
      const newUrls = res.map((f) => f.ufsUrl ?? f.url).filter(Boolean) as string[];
      setImageUrls((prev) => [...prev, ...newUrls].slice(0, 4));
    },
    onUploadError: (err) => {
      setUploading(false);
      setUploadProgress(0);
      setError("Upload failed: " + err.message);
    },
  });

  // Escape key closes, body scroll locked while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !uploading) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, uploading]);

  // Prevent accidental navigation while uploading
  useEffect(() => {
    if (!uploading) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [uploading]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const remaining = 4 - imageUrls.length;
    const toUpload = files.slice(0, remaining);
    setError(null);
    setUploading(true);
    setUploadProgress(0);
    await startUpload(toUpload);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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
    setError(null);
    setSaving(true);
    try {
      const body = { ...formData, imageUrls };
      const url = item ? `/api/items/${item.id}` : "/api/items";
      const method = item ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const canUploadMore = imageUrls.length < 4;

  return (
    /* Backdrop — click outside to close */
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !uploading) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {item ? t("editItem") : t("addItem")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
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
                    {CATEGORY_ICONS[c]} {tCat(c as Category)}
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

            {/* Upload progress banner */}
            {uploading && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="animate-spin h-4 w-4 text-amber-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span className="text-sm font-semibold text-amber-800">
                    {t("uploading")} — {t("dontLeave")}
                  </span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-amber-700 mt-1 text-right">{uploadProgress}%</p>
              </div>
            )}

            {/* Native file picker — hidden once 4 photos uploaded */}
            {canUploadMore && !uploading && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-sm font-medium">{t("choosePhotos")}</span>
                  <span className="text-xs text-gray-400">{t("imageHint")}</span>
                </button>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
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
