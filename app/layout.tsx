import { Geist } from "next/font/google";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// Root layout — intentionally minimal.
// The [locale]/layout.tsx handles <html>, <body>, and providers.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
