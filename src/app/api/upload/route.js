// import { NextResponse } from "next/server";
// import cloudinary from "@/lib/cloudinary";

// export async function POST() {
//   try {
//     const formData = await request.formData();
//     const image = formData.get("image");

//     if (!image) {
//       return NextResponse.json(
//         { message: "No image provided" },
//         { status: 400 }
//       );
//     }

//     const buffer = await image.arrayBuffer();
//     const base64 = Buffer.from(buffer).toString("base64");
//     const mimeType = image.type;
//     const dataUri = `data:${mimeType};base64,${base64}`;

//     const result = await cloudinary.uploader.upload(dataUri, {
//       folder: "authors",
//     });

//     return NextResponse.json({ imageUrl: result.secure_url });
//   } catch (error) {
//     console.error("Upload error:", error);
//     return NextResponse.json({ message: "Upload failed" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Convert buffer to base64
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(dataUri, {
      folder: "library/authors",
    });

    return NextResponse.json({
      imageUrl: uploadRes.secure_url,
      publicId: uploadRes.public_id,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
