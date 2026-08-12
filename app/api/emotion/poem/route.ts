import { NextRequest, NextResponse } from "next/server";
import { Client } from "@gradio/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { poem } = await req.json();

    if (!poem || typeof poem !== "string") {
      return NextResponse.json(
        {
          message: "Poem is required",
        },
        {
          status: 400,
        }
      );
    }

    // Connect to new Poem Semantic AI
    const client = await Client.connect(
      "recoX/birdparkpoem-emotion-ai"
    );

    // IMPORTANT:
    // Your new poem module uses:
    // api_name="analyze_poem"
    const result = await client.predict(
      "/analyze_poem",
      {
        poem,
      }
    );

    /*
      Expected Gradio response:

      result.data = [
        {
          analysis: {
            story: "...",
            cluster: "...",
            matching: {
              cluster: "...",
              embed_text: "..."
            }
          }
        }
      ]
    */

    const outputRaw = (result as any)?.data?.[0];

    let output = outputRaw;

    // Gradio may return JSON as a string
    if (typeof output === "string") {
      try {
        output = JSON.parse(output);
      } catch {
        // Keep original value
      }
    }

    if (!output) {
      return NextResponse.json(
        {
          message: "AI returned an empty response",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(output);
  } catch (error) {
    console.error(
      "[POEM_SEMANTIC_ANALYSIS_ERROR]",
      error
    );

    return NextResponse.json(
      {
        message: "Poem semantic analysis failed",
      },
      {
        status: 500,
      }
    );
  }
}