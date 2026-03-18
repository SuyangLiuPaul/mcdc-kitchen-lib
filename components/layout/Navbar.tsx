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

  // Swap locale in the current path
  function switchLocale() {
    const newPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
    router.push(newPath);
  }

  const role = session?.user?.role;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="font-bold text-lg text-gray-900 hover:text-gray-600"
        >
          {t("appName")}
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {session && (
            <>
              <Link
                href={`/${locale}/my-items`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {t("myItems")}
              </Link>
              <Link
                href={`/${locale}/my-items`}
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
              >
                + {t("addItem")}
              </Link>
              {role === "ADMIN" && (
                <Link
                  href={`/${locale}/admin`}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {t("admin")}
                </Link>
              )}
            </>
          )}

          {/* Locale switcher */}
          <button
            onClick={switchLocale}
            className="text-sm px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            {otherLocaleLabel}
          </button>

          {/* Auth */}
          {session ? (
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                {t("logout")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {t("login")}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
