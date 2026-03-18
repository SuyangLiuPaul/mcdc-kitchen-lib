import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/layout/Navbar";
import AuthSessionProvider from "@/components/layout/SessionProvider";
import "../globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MCDC Kitchen Library",
  description: "A community appliance sharing platform for MCDC members.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "zh")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={geist.className}>
        <AuthSessionProvider>
          <NextIntlClientProvider messages={messages}>
            <Navbar />
            <main className="min-h-screen bg-gray-50">{children}</main>
          </NextIntlClientProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
