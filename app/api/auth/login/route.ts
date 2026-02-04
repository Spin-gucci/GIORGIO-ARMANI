import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, or, ilike } from "drizzle-orm";
import * as schema from "@/shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    // First check system users (master, admin, agent)
    const [systemUser] = await db
      .select()
      .from(schema.users)
      .where(or(ilike(schema.users.email, email), ilike(schema.users.username, email)));

    if (systemUser) {
      if (systemUser.password !== password) {
        return NextResponse.json({ error: "Password salah" }, { status: 401 });
      }
      if (!systemUser.isActive) {
        return NextResponse.json({ error: "Akun Anda tidak aktif. Hubungi administrator." }, { status: 403 });
      }
      return NextResponse.json({
        user: {
          id: systemUser.id,
          name: systemUser.name,
          email: systemUser.email,
          role: systemUser.role,
        },
        message: "Login berhasil",
      });
    }

    // Check members (customers)
    const [member] = await db
      .select()
      .from(schema.members)
      .where(ilike(schema.members.email, email));

    if (!member) {
      return NextResponse.json({ error: "Email tidak ditemukan" }, { status: 401 });
    }

    if (member.password !== password) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // Check member status
    if (member.status === "pending") {
      return NextResponse.json(
        { error: "Akun Anda masih menunggu persetujuan Admin. Silakan tunggu konfirmasi.", status: "pending" },
        { status: 403 }
      );
    }

    if (member.status === "suspended" || member.isLocked) {
      return NextResponse.json(
        { error: member.lockReason || "Akun Anda telah dikunci. Hubungi admin untuk informasi lebih lanjut.", status: "locked" },
        { status: 403 }
      );
    }

    if (member.status === "rejected") {
      return NextResponse.json(
        { error: "Pendaftaran Anda ditolak. Hubungi admin untuk informasi lebih lanjut.", status: "rejected" },
        { status: 403 }
      );
    }

    // Return member info as customer
    return NextResponse.json({
      user: {
        id: member.id,
        name: member.name,
        email: member.email,
        role: "customer",
      },
      message: "Login berhasil",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Gagal melakukan login" }, { status: 500 });
  }
}
