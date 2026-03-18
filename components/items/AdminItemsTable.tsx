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
  const router = useRouter();

  async function deleteItem(id: string) {
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
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const title =
                  locale === "zh" && item.titleZh ? item.titleZh : item.title;
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{title}</td>
                    <td className="px-4 py-3 text-gray-500">{item.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          item.status === "AVAILABLE"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
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
                        className="text-red-600 hover:underline text-xs"
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
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
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
