import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCDC Kitchen Library",
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
