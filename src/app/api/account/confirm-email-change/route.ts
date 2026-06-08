import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAppUrl } from "@/lib/url";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const appUrl = await getAppUrl();
  const profileUrl = (status: "success" | "invalid" | "expired") =>
    `${appUrl}/dashboard/profile?emailChange=${status}`;

  if (!token) return NextResponse.redirect(profileUrl("invalid"));

  const request = await db.emailChangeRequest.findUnique({ where: { token } });
  if (!request) return NextResponse.redirect(profileUrl("invalid"));

  if (request.expiresAt < new Date()) {
    await db.emailChangeRequest.delete({ where: { id: request.id } });
    return NextResponse.redirect(profileUrl("expired"));
  }

  const user = await db.user.findUnique({ where: { id: request.userId } });
  if (!user || user.email !== request.oldEmail) {
    await db.emailChangeRequest.delete({ where: { id: request.id } });
    return NextResponse.redirect(profileUrl("invalid"));
  }

  const taken = await db.user.findUnique({ where: { email: request.newEmail } });
  if (taken && taken.id !== user.id) {
    await db.emailChangeRequest.delete({ where: { id: request.id } });
    return NextResponse.redirect(profileUrl("invalid"));
  }

  await db.user.update({ where: { id: user.id }, data: { email: request.newEmail, emailVerified: false } });
  await db.emailChangeRequest.delete({ where: { id: request.id } });

  return NextResponse.redirect(profileUrl("success"));
}
