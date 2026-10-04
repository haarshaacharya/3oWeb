import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const publicDir = path.join(process.cwd(), "public");
  const files = ["30logo.png", "footer-logo.png", "3ologo.png"];
  const details = files.map(file => {
    const p = path.join(publicDir, file);
    return {
      file,
      exists: fs.existsSync(p),
      size: fs.existsSync(p) ? fs.statSync(p).size : 0
    };
  });
  return NextResponse.json({ details });
}
