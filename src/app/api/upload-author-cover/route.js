import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

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
    const arrayBuffer = await image.arrayBuffer();
    const buffer2 = Buffer.from(arrayBuffer);

    const uploadedResponse = await cloudinary.uploader.upload(
      "data:image/png;base64," + buffer2.toString("base64"),
      {
        folder: "authors",
      }
    );

    return NextResponse.json({ imageUrl: uploadedResponse.secure_url });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return NextResponse.json(
      { message: "Failed to upload image" },
      { status: 500 }
    );
  }
}
