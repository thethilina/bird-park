import { NextRequest, NextResponse } from "next/server";
import { Client } from "@gradio/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { poem } = await req.json();

    if (!poem) {
      return NextResponse.json(
        {
          message: "Poem is required",
        },
        {
          status: 400,
        }
      );
    }


    const client = await Client.connect(
      "recoX/birdparkpoem-emotion-ai"
    );


    const result = await client.predict(
      "/analyze_emotion",
      {
        poem,
      }
    );


// result.data can be unknown according to types; cast safely
const outputRaw = (result as any)?.data?.[0];
let output = outputRaw;

if (typeof output === "string") {
  try {
    output = JSON.parse(output);
  } catch (e) {
    // keep original string if it's not valid JSON
  }
}

return NextResponse.json(output);


  } catch (err) {

    console.error(
      "[POEM_EMOTION_ERROR]",
      err
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