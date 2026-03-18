import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
        <p>{t("tagline")}</p>
        <div className="flex flex-col sm:items-end gap-1 text-center sm:text-right">
          <p>&copy; {year} {t("copyright")}</p>
          <p>
            {t("contact")}{" "}
            <a
              href="mailto:Paul.sy.liu@gmail.com"
              className="text-indigo-400 hover:text-indigo-600 transition-colors"
            >
              Paul.sy.liu@gmail.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
