"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const otherLocale = locale === "en" ? "zh" : "en";
  const otherLocaleLabel = locale === "en" ? "中文" : "EN";
  const role = session?.user?.role;

  function switchLocale() {
    const newPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
    router.push(newPath);
    setMenuOpen(false);
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[4.5rem] flex items-center justify-between">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="font-bold text-xl text-indigo-700 hover:text-indigo-900 tracking-tight"
        >
          {t("appName")}
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          {session && (
            <>
              <Link
                href={`/${locale}/my-items`}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {t("myItems")}
              </Link>
              <Link
                href={`/${locale}/my-items?add=1`}
                className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                + {t("addItem")}
              </Link>
              {role === "ADMIN" && (
                <Link
                  href={`/${locale}/admin`}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  {t("admin")}
                </Link>
              )}
            </>
          )}

          <button
            onClick={switchLocale}
            className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
          >
            {otherLocaleLabel}
          </button>

          {session ? (
            <div className="flex items-center gap-3">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  width={34}
                  height={34}
                  className="rounded-full ring-2 ring-indigo-100"
                />
              )}
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
              >
                {t("logout")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              {t("login")}
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white divide-y divide-gray-50">
          <div className="px-4 py-3 space-y-1">
            {session ? (
              <>
                <Link
                  href={`/${locale}/my-items`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  {t("myItems")}
                </Link>
                <Link
                  href={`/${locale}/my-items?add=1`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm font-medium text-indigo-600"
                >
                  + {t("addItem")}
                </Link>
                {role === "ADMIN" && (
                  <Link
                    href={`/${locale}/admin`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
                  >
                    {t("admin")}
                  </Link>
                )}
              </>
            ) : (
              <button
                onClick={() => { signIn("google"); setMenuOpen(false); }}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium mt-1"
              >
                {t("login")}
              </button>
            )}
          </div>

          <div className="px-4 py-3 flex items-center justify-between">
            {session && (
              <div className="flex items-center gap-2">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? ""}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm text-gray-600">{session.user?.name}</span>
              </div>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={switchLocale}
                className="text-sm px-3 py-1 rounded-md border border-gray-300 text-gray-600 font-medium"
              >
                {otherLocaleLabel}
              </button>
              {session && (
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="text-sm text-red-500 font-medium"
                >
                  {t("logout")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
