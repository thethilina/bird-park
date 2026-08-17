/**
 * Shared client-side emotion analysis functions.
 * These functions make HTTP requests to the Hugging Face AI endpoints via our local Next.js proxy route,
 * and update the post documents with the returned semantic and emotion analysis.
 */

export const analyzeArtEmotion = async (postId: string, file: File) => {
  try {
    // 1. Mark AI analysis as processing
    await fetch(`/api/post/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emotionAnalysis: {
          status: "processing",
        },
      }),
    });

    // 2. Send artwork to AI API
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/emotion/art", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Artwork AI analysis failed");
    }

    const data = await response.json();
    const analysis = data?.analysis;

    if (!analysis) {
      throw new Error("Invalid artwork AI response");
    }

    const story = analysis.story;
    const cluster = analysis.cluster;
    const matching = analysis.matching;

    if (!story || !cluster || !matching) {
      throw new Error("Incomplete artwork AI response");
    }

    // 3. Save semantic analysis
    await fetch(`/api/post/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        semanticAnalysis: {
          story,
          cluster,
          matching: {
            cluster: matching.cluster,
            embedText: matching.embed_text,
            embedding: [],
          },
        },
        emotionAnalysis: {
          status: "completed",
          completedAt: new Date(),
        },
      }),
    });

    console.log("Artwork semantic analysis completed.");
  } catch (err) {
    console.error("[ART_ANALYSIS_ERROR]", err);
    try {
      await fetch(`/api/post/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emotionAnalysis: {
            status: "failed",
            completedAt: null,
          },
        }),
      });
    } catch (patchError) {
      console.error("Failed to update AI status:", patchError);
    }
  }
};

export const analyzePoemEmotion = async (postId: string, poemText: string) => {
  try {
    // 1. Mark AI analysis as processing
    await fetch(`/api/post/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emotionAnalysis: {
          status: "processing",
        },
      }),
    });

    // 2. Send poem to AI API
    const response = await fetch("/api/emotion/poem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        poem: poemText,
      }),
    });

    if (!response.ok) {
      throw new Error("Poem AI analysis failed");
    }

    const data = await response.json();
    const analysis = data?.analysis;

    if (!analysis) {
      throw new Error("Invalid poem AI response");
    }

    const story = analysis.story;
    const cluster = analysis.cluster;
    const matching = analysis.matching;

    if (!story || !cluster || !matching) {
      throw new Error("Incomplete poem AI analysis");
    }

    // 3. Save semantic analysis
    await fetch(`/api/post/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        semanticAnalysis: {
          story,
          cluster,
          matching: {
            cluster: matching.cluster,
            embedText: matching.embed_text,
            embedding: [],
          },
        },
        emotionAnalysis: {
          status: "completed",
          completedAt: new Date(),
        },
      }),
    });

    console.log("Poem semantic analysis completed.");
  } catch (err) {
    console.error("[POEM_ANALYSIS_ERROR]", err);
    try {
      await fetch(`/api/post/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emotionAnalysis: {
            status: "failed",
            completedAt: null,
          },
        }),
      });
    } catch (patchError) {
      console.error("Failed to update AI status:", patchError);
    }
  }
};
