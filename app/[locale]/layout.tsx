import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthSessionProvider from "@/components/layout/SessionProvider";
import ToastProvider from "@/components/layout/ToastProvider";
import "../globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GraceShare | 恩典流转站",
  description: "Share the love, save the earth. A community platform to lend and borrow household items with your neighbours.",
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
    <AuthSessionProvider>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <ToastProvider>
          <div className={geist.className}>
            <Navbar />
            <main className="min-h-screen bg-gray-50">{children}</main>
            <Footer />
          </div>
        </ToastProvider>
      </NextIntlClientProvider>
    </AuthSessionProvider>
  );
}
