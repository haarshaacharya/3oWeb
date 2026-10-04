import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const p = path.join(process.cwd(), "public", "30logo.png");
  const buf = fs.readFileSync(p);
  // PNG header check
  return NextResponse.json({ size: buf.length, isPng: buf.slice(0, 8).toString("hex") === "89504e470d0a1a0a" });
}
