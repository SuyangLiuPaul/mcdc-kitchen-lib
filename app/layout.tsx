import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GraceShare | 恩典流转站",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
};

// Root layout must include <html> and <body>.
// The [locale]/layout.tsx sets the correct lang attribute and providers.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
