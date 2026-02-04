import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, ilike } from "drizzle-orm";
import * as schema from "@/shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export async function POST(request: Request) {
  try {
    const { name, email, phone, password, invitationCode } = await request.json();

    // Validate required fields
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Nama minimal 2 karakter" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }
    if (!invitationCode) {
      return NextResponse.json({ error: "Kode undangan wajib diisi" }, { status: 400 });
    }

    // Validate invitation code - find the agent
    const [agent] = await db
      .select()
      .from(schema.users)
      .where(
        and(
          ilike(schema.users.invitationCode, invitationCode),
          eq(schema.users.role, "agent"),
          eq(schema.users.isActive, true)
        )
      );

    if (!agent) {
      return NextResponse.json({ error: "Kode undangan tidak valid atau agent tidak aktif" }, { status: 400 });
    }

    // Check if email already exists in members
    const [existingMember] = await db
      .select()
      .from(schema.members)
      .where(ilike(schema.members.email, email));

    if (existingMember) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // Check if email already exists in users
    const [existingUser] = await db
      .select()
      .from(schema.users)
      .where(ilike(schema.users.email, email));

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // Create new member with pending status
    const [member] = await db
      .insert(schema.members)
      .values({
        name,
        email,
        phone: phone || null,
        password,
        status: "pending",
        balance: 0,
        isLocked: false,
        withdrawalLocked: false,
        assignedAgentId: agent.id,
      })
      .returning();

    // Create activity log
    await db.insert(schema.activityLogs).values({
      action: "Pendaftaran Baru",
      description: `${member.name} mendaftar melalui kode undangan ${agent.name} dan menunggu persetujuan`,
      memberId: member.id,
      userId: agent.id,
      userRole: "agent",
      userName: agent.name,
    });

    return NextResponse.json(
      {
        message: `Pendaftaran berhasil! Anda terdaftar di bawah Agent ${agent.name}. Akun Anda akan diaktifkan setelah disetujui.`,
        status: "pending",
        agentName: agent.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Gagal melakukan pendaftaran" }, { status: 500 });
  }
}
