import { NextRequest, NextResponse } from "next/server";
import { parsePdf } from "@/lib/pdf-parser";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds the 50 MB limit" }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify PDF magic bytes (%PDF) to reject spoofed MIME types
    if (buffer[0] !== 0x25 || buffer[1] !== 0x50 || buffer[2] !== 0x44 || buffer[3] !== 0x46) {
      return NextResponse.json({ error: "File is not a valid PDF" }, { status: 400 });
    }

    const { text, pageCount, info } = await parsePdf(buffer);

    return NextResponse.json({
      text,
      pageCount,
      fileName: file.name,
      info,
    });
  } catch (err) {
    console.error("[/api/upload]", err);
    return NextResponse.json(
      { error: "Unable to read PDF. The file may be corrupted or password-protected." },
      { status: 500 }
    );
  }
}
