import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, ilike } from "drizzle-orm";
import * as schema from "@/shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const [agent] = await db
      .select()
      .from(schema.users)
      .where(
        and(
          ilike(schema.users.invitationCode, code),
          eq(schema.users.role, "agent"),
          eq(schema.users.isActive, true)
        )
      );

    if (!agent) {
      return NextResponse.json({ valid: false, error: "Kode undangan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      agentName: agent.name,
      agentId: agent.id,
    });
  } catch (error) {
    console.error("Verify invitation error:", error);
    return NextResponse.json({ valid: false, error: "Gagal memverifikasi kode" }, { status: 500 });
  }
}
