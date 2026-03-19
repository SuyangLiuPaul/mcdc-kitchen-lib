import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminItemsTable from "@/components/items/AdminItemsTable";
import ActivityLogPanel from "@/components/admin/ActivityLogPanel";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect(`/${locale}`);
  }

  const t = await getTranslations("admin");

  const [items, users] = await Promise.all([
    prisma.item.findMany({
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("title")}</h1>
      <AdminItemsTable items={items} users={users} locale={locale} currentUserId={session.user.id} />
      <div className="mt-12">
        <ActivityLogPanel />
      </div>
    </div>
  );
}
