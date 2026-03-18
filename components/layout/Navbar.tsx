"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Loader2, Globe } from "lucide-react";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [switchingLocale, setSwitchingLocale] = useState(false);

  const isSessionLoading = status === "loading";
  const otherLocale = locale === "en" ? "zh" : "en";
  const otherLocaleLabel = locale === "en" ? "中文" : "EN";
  const role = session?.user?.role;

  function switchLocale() {
    setSwitchingLocale(true);
    const segments = pathname.split("/");
    segments[1] = otherLocale;
    router.push(segments.join("/"));
    setMenuOpen(false);
  }

  async function handleSignIn() {
    setSigningIn(true);
    await signIn("google", { callbackUrl: `/${locale}` });
    // page navigates away — no need to reset
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
      isActive(href) ? "text-indigo-700" : "text-gray-600 hover:text-gray-900"
    }`;

  // Auth section shared between desktop and mobile
  function AuthButtons({ mobile = false }: { mobile?: boolean }) {
    if (isSessionLoading) {
      // Skeleton placeholder to avoid layout flash
      return (
        <div className={`flex items-center gap-2 ${mobile ? "w-full" : ""}`}>
          <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      );
    }

    if (session) {
      return (
        <div className={`flex items-center gap-3 ${mobile ? "w-full" : ""}`}>
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "User"}
              width={mobile ? 26 : 34}
              height={mobile ? 26 : 34}
              className="rounded-full ring-2 ring-indigo-100 shrink-0"
            />
          )}
          {mobile && (
            <span className="text-sm text-gray-600 truncate flex-1">{session.user?.name}</span>
          )}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className={`text-sm font-medium transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-60 ${
              mobile ? "text-red-500" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {signingOut ? (
              <Loader2 size={13} className="animate-spin" />
            ) : null}
            {signingOut ? (locale === "zh" ? "退出中..." : "Signing out...") : t("logout")}
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={handleSignIn}
        disabled={signingIn}
        className={`text-sm font-medium transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 ${
          mobile
            ? "w-full bg-indigo-600 text-white py-2.5 rounded-lg mt-1"
            : "bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        }`}
      >
        {signingIn ? (
          <Loader2 size={14} className="animate-spin" />
        ) : null}
        {signingIn
          ? (locale === "zh" ? "跳转中..." : "Redirecting...")
          : t("login")}
      </button>
    );
  }

  function LocaleButton({ mobile = false }: { mobile?: boolean }) {
    return (
      <button
        onClick={switchLocale}
        disabled={switchingLocale}
        className={`flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors active:scale-95 disabled:opacity-60 ${
          mobile ? "px-1 py-1" : ""
        }`}
      >
        {switchingLocale
          ? <Loader2 size={14} className="animate-spin" />
          : <Globe size={14} />}
        {switchingLocale ? "..." : otherLocaleLabel}
      </button>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[4.5rem] flex items-center justify-between">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="font-bold text-xl text-indigo-700 hover:text-indigo-900 tracking-tight transition-colors"
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
                className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-all active:scale-95"
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

          <LocaleButton />
          <AuthButtons />
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors active:scale-95"
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
                  className={`flex items-center gap-2 py-2 text-sm font-medium active:opacity-70 ${
                    isActive(`/${locale}/my-items`) ? "text-indigo-700" : "text-gray-700"
                  }`}
                >
                  {t("myItems")}
                </Link>
                <Link
                  href={`/${locale}/my-items?add=1`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm font-medium text-indigo-600 active:opacity-70"
                >
                  + {t("addItem")}
                </Link>
                {role === "ADMIN" && (
                  <Link
                    href={`/${locale}/admin`}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 py-2 text-sm font-medium active:opacity-70 ${
                      isActive(`/${locale}/admin`) ? "text-indigo-700" : "text-gray-700"
                    }`}
                  >
                    {t("admin")}
                  </Link>
                )}
              </>
            ) : (
              <AuthButtons mobile />
            )}
          </div>

          <div className="px-4 py-3 flex items-center justify-between gap-3">
            {session && <AuthButtons mobile />}
            <div className="flex items-center gap-3 ml-auto shrink-0">
              <LocaleButton mobile />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
