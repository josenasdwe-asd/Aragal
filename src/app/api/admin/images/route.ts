import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  const dir = path.join(process.cwd(), "public", "assets", "images");
  try {
    const files = fs
      .readdirSync(dir)
      .filter((f) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f))
      .map((f) => ({ name: f, url: `/assets/images/${f}` }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ ok: true, data: files });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
