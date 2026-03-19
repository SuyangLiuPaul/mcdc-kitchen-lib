import { prisma } from "@/lib/prisma";

export type ActivityAction =
  | "LOGIN"
  | "ITEM_CREATE"
  | "ITEM_EDIT"
  | "ITEM_DELETE"
  | "STATUS_CHANGE"
  | "USER_ROLE_CHANGE"
  | "USER_DELETE"
  | "DESCRIPTION_GENERATE";

// Fire-and-forget — never blocks the caller
export function logActivity(data: {
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  action: ActivityAction;
  target?: string | null;
  detail?: string | null;
}) {
  prisma.activityLog.create({ data }).catch(() => {});
}
