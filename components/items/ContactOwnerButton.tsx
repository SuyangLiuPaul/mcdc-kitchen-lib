"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession, signIn } from "next-auth/react";
import { Copy, Check, Mail } from "lucide-react";

export default function ContactOwnerButton({ email }: { email: string }) {
  const t = useTranslations("item");
  const { data: session } = useSession();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn("google")}
        className="inline-flex items-center gap-2 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
      >
        <Mail size={14} />
        {t("contactOwner")}
      </button>
    );
  }

  if (revealed) {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <a
          href={`mailto:${email}`}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2"
        >
          {email}
        </a>
        <button
          onClick={handleCopy}
          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            copied
              ? "border-emerald-200 text-emerald-600 bg-emerald-50"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
          title={copied ? t("copied") : t("copy")}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? t("copied") : t("copy")}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setRevealed(true)}
      className="inline-flex items-center gap-2 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
    >
      <Mail size={14} />
      {t("contactOwner")}
    </button>
  );
}
