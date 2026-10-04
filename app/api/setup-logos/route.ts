import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const cwd = process.cwd();
    ["check-images", "check-png", "setup-logos"].forEach(d => {
      const p = path.join(cwd, "app", "api", d);
      if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
    });
    return NextResponse.json({ cleaned: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
