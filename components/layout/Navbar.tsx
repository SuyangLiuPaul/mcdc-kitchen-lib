"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Loader2 } from "lucide-react";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const otherLocale = locale === "en" ? "zh" : "en";
  const otherLocaleLabel = locale === "en" ? "中文" : "EN";
  const role = session?.user?.role;

  // Replace only the first path segment (the locale)
  function switchLocale() {
    const segments = pathname.split("/");
    segments[1] = otherLocale;
    router.push(segments.join("/"));
    setMenuOpen(false);
  }

  async function handleSignIn() {
    setSigningIn(true);
    await signIn("google");
    setSigningIn(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: `/${locale}` });
  }

  function isActive(href: string) {
    return pathname.startsWith(href);
  }

  const navLinkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      isActive(href)
        ? "text-indigo-700"
        : "text-gray-600 hover:text-gray-900"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[4.5rem] flex items-center justify-between">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="font-bold text-xl text-indigo-700 hover:text-indigo-900 tracking-tight"
          onClick={() => setMenuOpen(false)}
        >
          {t("appName")}
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          {session && (
            <>
              <Link href={`/${locale}/my-items`} className={navLinkClass(`/${locale}/my-items`)}>
                {t("myItems")}
              </Link>
              <Link
                href={`/${locale}/my-items?add=1`}
                className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                + {t("addItem")}
              </Link>
              {role === "ADMIN" && (
                <Link href={`/${locale}/admin`} className={navLinkClass(`/${locale}/admin`)}>
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
                onClick={handleSignOut}
                disabled={signingOut}
                className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {signingOut && <Loader2 size={13} className="animate-spin" />}
                {t("logout")}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={signingIn}
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {signingIn && <Loader2 size={14} className="animate-spin" />}
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
                  className={`flex items-center gap-2 py-2 text-sm font-medium ${
                    isActive(`/${locale}/my-items`) ? "text-indigo-700" : "text-gray-700"
                  }`}
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
                    className={`flex items-center gap-2 py-2 text-sm font-medium ${
                      isActive(`/${locale}/admin`) ? "text-indigo-700" : "text-gray-700"
                    }`}
                  >
                    {t("admin")}
                  </Link>
                )}
              </>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium mt-1 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {signingIn && <Loader2 size={14} className="animate-spin" />}
                {t("login")}
              </button>
            )}
          </div>

          <div className="px-4 py-3 flex items-center justify-between gap-3">
            {session && (
              <div className="flex items-center gap-2 min-w-0">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? ""}
                    width={26}
                    height={26}
                    className="rounded-full shrink-0"
                  />
                )}
                <span className="text-sm text-gray-600 truncate">{session.user?.name}</span>
              </div>
            )}
            <div className="flex items-center gap-3 ml-auto shrink-0">
              <button
                onClick={switchLocale}
                className="text-sm px-3 py-1 rounded-md border border-gray-300 text-gray-600 font-medium"
              >
                {otherLocaleLabel}
              </button>
              {session && (
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="text-sm text-red-500 font-medium flex items-center gap-1 disabled:opacity-60"
                >
                  {signingOut && <Loader2 size={12} className="animate-spin" />}
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
