import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

interface AuthResult {
  userId: string;
}

export async function getAuthUser(): Promise<AuthResult | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { userId: session.user.id };
}

export function isUnauthorized(
  result: AuthResult | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
