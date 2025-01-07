import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder");

  if (!folder) {
    return NextResponse.json(
      { error: "Folder parameter is required" },
      { status: 400 },
    );
  }

  try {
    const folderPath = path.join(process.cwd(), "public", "images", folder);
    const files = fs.readdirSync(folderPath);

    // Filter for image files only (including SVG)
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file),
    );

    return NextResponse.json({
      images: imageFiles,
      count: imageFiles.length,
    });
  } catch (error) {
    console.error("Error reading directory:", error);
    return NextResponse.json(
      {
        error: "Failed to read directory",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
