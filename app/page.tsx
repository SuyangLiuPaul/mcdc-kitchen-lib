import { redirect } from "next/navigation";

// Root "/" redirects to the default locale
export default function RootPage() {
  redirect("/en");
}
