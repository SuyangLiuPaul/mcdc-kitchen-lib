"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";

export default function ShareButtons({ title }: { title: string }) {
  const t = useTranslations("item");
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title} — GraceShare`);

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-400 font-medium">{t("share")}</span>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:opacity-90 transition-opacity active:scale-95"
        aria-label="Share on WhatsApp"
      >
        {/* WhatsApp icon */}
        <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 fill-current">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.49 2.031 7.796L0 32l8.469-2.219A15.93 15.93 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.406 22.594c-.344.969-1.719 1.781-2.813 2.016-.75.156-1.719.281-5-.031-4.281-.406-7.031-3.156-7.219-3.344C9.188 21.05 7 18.344 7 15.531c0-2.813 1.469-4.188 2-4.75.469-.5 1.031-.625 1.375-.625h.969c.344 0 .813-.063 1.25 1.031.469 1.156 1.594 3.969 1.719 4.25.125.281.219.625.031.969-.188.344-.281.563-.563.875-.281.313-.594.688-.844.938-.281.281-.563.594-.25 1.156.313.563 1.406 2.313 3.031 3.75 2.063 1.813 3.813 2.406 4.344 2.656.531.25.844.219 1.156-.125.313-.344 1.344-1.563 1.719-2.094.344-.531.688-.438 1.156-.25.469.188 2.969 1.406 3.469 1.656.5.25.844.375.969.594.125.219.125 1.25-.219 2.219z"/>
        </svg>
        WhatsApp
      </a>

      {/* WeChat — generates a scannable QR code (standard web-to-WeChat flow) */}
      <a
        href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#07C160] text-white text-xs font-semibold hover:opacity-90 transition-opacity active:scale-95"
        aria-label="Share via WeChat QR code"
        title={t("wechatHint")}
      >
        {/* WeChat icon */}
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
          <path d="M9.5 4C5.358 4 2 7.02 2 10.75c0 1.874.87 3.564 2.27 4.763l-.521 1.564 1.821-.91a7.866 7.866 0 0 0 1.93.573 5.54 5.54 0 0 1-.25-1.615C7.25 11.54 10.356 9 14.25 9c.277 0 .55.015.82.042C14.2 6.173 12.077 4 9.5 4zM7 8.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm5 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm2.25 6.625c0 3.073 2.832 5.5 6.25 5.5 1.05 0 2.038-.262 2.89-.718l1.61.718-.538-1.614C21.407 17.94 22 16.847 22 15.625 22 12.552 19.168 10 15.75 10s-6.25 2.552-6.25 5.625zm4-1.375a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm4.5 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z"/>
        </svg>
        {t("wechat")}
      </a>

      {/* Copy link */}
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors active:scale-95"
      >
        {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
        {copied ? t("copied") : t("copy")}
      </button>
    </div>
  );
}
