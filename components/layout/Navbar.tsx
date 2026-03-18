"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const otherLocale = locale === "en" ? "zh" : "en";
  const otherLocaleLabel = locale === "en" ? "中文" : "EN";

  function switchLocale() {
    const newPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
    router.push(newPath);
  }

  const role = session?.user?.role;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between" style={{ height: "4.5rem" }}>
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="font-bold text-xl text-indigo-700 hover:text-indigo-900 tracking-tight"
        >
          {t("appName")}
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-5">
          {session && (
            <>
              <Link
                href={`/${locale}/my-items`}
                className="text-base text-gray-600 hover:text-gray-900 font-medium"
              >
                {t("myItems")}
              </Link>
              <Link
                href={`/${locale}/my-items?add=1`}
                className="text-base bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                + {t("addItem")}
              </Link>
              {role === "ADMIN" && (
                <Link
                  href={`/${locale}/admin`}
                  className="text-base text-gray-600 hover:text-gray-900 font-medium"
                >
                  {t("admin")}
                </Link>
              )}
            </>
          )}

          {/* Locale switcher */}
          <button
            onClick={switchLocale}
            className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
          >
            {otherLocaleLabel}
          </button>

          {/* Auth */}
          {session ? (
            <div className="flex items-center gap-3">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  width={36}
                  height={36}
                  className="rounded-full ring-2 ring-indigo-100"
                />
              )}
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-800 font-medium"
              >
                {t("logout")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="text-base bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              {t("login")}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
