import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

// PATCH /api/admin/users/[id] — toggle role USER ↔ ADMIN
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
  const target = await prisma.user.findUnique({ where: { id }, select: { name: true, email: true } });
  const updated = await prisma.user.update({ where: { id }, data: { role: newRole } });

  logActivity({
    userId: session.user.id,
    userName: session.user.name,
    userEmail: session.user.email,
    action: "USER_ROLE_CHANGE",
    target: target?.name ?? target?.email ?? id,
    detail: `${user.role} → ${newRole}`,
  });

  return NextResponse.json(updated);
}

// DELETE /api/admin/users/[id] — delete user and all their items (cascade)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  const deletedUser = await prisma.user.findUnique({ where: { id }, select: { name: true, email: true } });
  await prisma.user.delete({ where: { id } });

  logActivity({
    userId: session.user.id,
    userName: session.user.name,
    userEmail: session.user.email,
    action: "USER_DELETE",
    target: deletedUser?.name ?? deletedUser?.email ?? id,
  });

  return NextResponse.json({ success: true });
}
