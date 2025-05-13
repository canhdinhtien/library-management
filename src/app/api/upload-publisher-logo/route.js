import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json(
        { message: "No image provided" },
        { status: 400 }
      );
    }

    const buffer = await image.arrayBuffer();
    const filename = `${Date.now()}-${image.name}`;
    const filepath = path.join(
      process.cwd(),
      "public/images/publishers",
      filename
    );

    await fs.writeFile(filepath, Buffer.from(buffer));

    const imageUrl = `/images/publishers/${filename}`;
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return NextResponse.json(
      { message: "Failed to upload image" },
      { status: 500 }
    );
  }
}
