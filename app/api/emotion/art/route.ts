import { NextRequest, NextResponse } from "next/server";
import { Client, handle_file } from "@gradio/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        {
          message: "Image is required",
        },
        {
          status: 400,
        }
      );
    }


    const client = await Client.connect(
      "recoX/birdparkpaint-emotion-ai"
    );


    const result = await client.predict(
      "/analyze_emotion",
      {
        image: await handle_file(file),
      }
    );


    /*
      Normalize Gradio response
    */

    const output = Array.isArray(result.data)
      ? result.data[0]
      : result.data;


    return NextResponse.json(output);


  } catch (error) {

    console.error(
      "[ART_EMOTION_ERROR]",
      error
    );


    return NextResponse.json(
      {
        message: "Emotion analysis failed",
      },
      {
        status: 500,
      }
    );
  }
}