"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  title: string;
  titleZh: string | null;
  category: string | null;
  status: string;
  owner: { name: string | null; email: string | null };
};

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

export default function AdminItemsTable({
  items,
  users,
  locale,
}: {
  items: Item[];
  users: User[];
  locale: string;
}) {
  const t = useTranslations("admin");
  const tCat = useTranslations("categories");
  const router = useRouter();

  async function deleteItem(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold mb-4">{t("allItems")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">{t("colTitle")}</th>
                <th className="px-4 py-3 text-left">{t("colCategory")}</th>
                <th className="px-4 py-3 text-left">{t("colStatus")}</th>
                <th className="px-4 py-3 text-left">{t("colOwner")}</th>
                <th className="px-4 py-3 text-left">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const title =
                  locale === "zh" && item.titleZh ? item.titleZh : item.title;
                const categoryLabel = item.category
                  ? tCat(item.category as "Kitchen" | "Cleaning" | "Tools" | "Other")
                  : "—";
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{title}</td>
                    <td className="px-4 py-3 text-gray-500">{categoryLabel}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.status === "AVAILABLE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.owner.name}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium hover:underline"
                      >
                        {t("deleteItem")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t("allUsers")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">{t("colName")}</th>
                <th className="px-4 py-3 text-left">{t("colEmail")}</th>
                <th className="px-4 py-3 text-left">{t("colRole")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
