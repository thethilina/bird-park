import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SPACE_URL =
  "https://recox-birdparkpaint-emotion-ai.hf.space";

export async function POST(req: NextRequest) {
  try {
    // --------------------------------------------------------
    // Check token
    // --------------------------------------------------------

    const hfToken = process.env.NEXT_PUBLIC_HF_TOKEN;

    if (!hfToken) {
      console.error(
        "[ART_SEMANTIC_ANALYSIS] HF_TOKEN missing"
      );

      return NextResponse.json(
        {
          message:
            "Hugging Face token is not configured",
        },
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------------------
    // Get image
    // --------------------------------------------------------

    const formData = await req.formData();

    const file =
      formData.get("image") as File | null;

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

    // --------------------------------------------------------
    // Upload image to Gradio
    // --------------------------------------------------------

    const uploadForm =
      new FormData();

    uploadForm.append(
      "files",
      file,
      file.name
    );

    const uploadResponse =
      await fetch(
        `${SPACE_URL}/gradio_api/upload`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${hfToken}`,
          },

          body: uploadForm,
        }
      );

    if (!uploadResponse.ok) {
      const errorText =
        await uploadResponse.text();

      console.error(
        "[HF_UPLOAD_ERROR]",
        uploadResponse.status,
        errorText
      );

      throw new Error(
        "Failed to upload artwork to Hugging Face"
      );
    }

    const uploadResult =
      await uploadResponse.json();

    console.log(
      "[HF_UPLOAD_RESULT]",
      uploadResult
    );

    const imagePath =
      uploadResult[0];

    if (!imagePath) {
      throw new Error(
        "Hugging Face did not return an image path"
      );
    }

    // --------------------------------------------------------
    // Start Gradio prediction
    // --------------------------------------------------------

    const predictResponse =
      await fetch(
        `${SPACE_URL}/gradio_api/call/analyze_artwork`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${hfToken}`,
          },

          body: JSON.stringify({
            data: [
              {
                path: imagePath,
                meta: {
                  _type:
                    "gradio.FileData",
                },
              },
            ],
          }),
        }
      );

    if (!predictResponse.ok) {
      const errorText =
        await predictResponse.text();

      console.error(
        "[HF_PREDICT_ERROR]",
        predictResponse.status,
        errorText
      );

      throw new Error(
        "Failed to start artwork analysis"
      );
    }

    const predictResult =
      await predictResponse.json();

    console.log(
      "[HF_PREDICT_RESULT]",
      predictResult
    );

    const eventId =
      predictResult.event_id;

    if (!eventId) {
      throw new Error(
        "Hugging Face did not return an event ID"
      );
    }

    // --------------------------------------------------------
    // Wait for result
    // --------------------------------------------------------

    const resultResponse =
      await fetch(
        `${SPACE_URL}/gradio_api/call/analyze_artwork/${eventId}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${hfToken}`,
          },
        }
      );

    if (!resultResponse.ok) {
      const errorText =
        await resultResponse.text();

      console.error(
        "[HF_RESULT_ERROR]",
        resultResponse.status,
        errorText
      );

      throw new Error(
        "Failed to retrieve artwork analysis"
      );
    }

    // --------------------------------------------------------
    // Gradio returns Server-Sent Events
    // --------------------------------------------------------

    const resultText =
      await resultResponse.text();

    console.log(
      "[HF_RAW_RESULT]",
      resultText
    );

    // Find the final complete event
    const events =
      resultText
        .split("\n\n")
        .filter(Boolean);

    let finalData: any = null;

    for (const event of events) {

      const lines =
        event.split("\n");

      const eventType =
        lines
          .find(
            (line) =>
              line.startsWith(
                "event:"
              )
          )
          ?.replace(
            "event:",
            ""
          )
          .trim();

      const dataLine =
        lines
          .find(
            (line) =>
              line.startsWith(
                "data:"
              )
          );

      if (
        eventType ===
          "complete" &&
        dataLine
      ) {

        const jsonString =
          dataLine
            .replace(
              "data:",
              ""
            )
            .trim();

        finalData =
          JSON.parse(
            jsonString
          );
      }
    }

    if (!finalData) {
      throw new Error(
        "No completed analysis returned by Hugging Face"
      );
    }

    // --------------------------------------------------------
    // Gradio output
    //
    // finalData is normally:
    //
    // [
    //   {
    //     analysis: {...}
    //   }
    // ]
    // --------------------------------------------------------

    const output =
      Array.isArray(finalData)
        ? finalData[0]
        : finalData;

    return NextResponse.json(
      output
    );

  } catch (error) {

    console.error(
      "[ART_SEMANTIC_ANALYSIS_ERROR]",
      error
    );

    return NextResponse.json(
      {
        message:
          "Artwork semantic analysis failed",

        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}