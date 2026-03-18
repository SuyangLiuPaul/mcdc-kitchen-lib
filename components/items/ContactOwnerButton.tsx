"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession, signIn } from "next-auth/react";

export default function ContactOwnerButton({ email }: { email: string }) {
  const t = useTranslations("item");
  const { data: session } = useSession();
  const [revealed, setRevealed] = useState(false);

  if (!session) {
    return (
      <button
        onClick={() => signIn("google")}
        className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
      >
        {t("contactOwner")}
      </button>
    );
  }

  if (revealed) {
    return (
      <a
        href={`mailto:${email}`}
        className="text-sm text-indigo-600 underline hover:text-indigo-800"
      >
        {email}
      </a>
    );
  }

  return (
    <button
      onClick={() => setRevealed(true)}
      className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
    >
      {t("contactOwner")}
    </button>
  );
}
