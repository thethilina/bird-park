import { NextResponse } from "next/server";
import cloudinary from "../../../lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const result =
      await new Promise<any>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "bird-park",
              },
              (err, res) => {
                if (err) reject(err);
                else resolve(res);
              }
            )
            .end(buffer);
        }
      );

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Upload failed" + (error instanceof Error ? `: ${error.message}` : "") },
      { status: 500 }
    );
  }
}