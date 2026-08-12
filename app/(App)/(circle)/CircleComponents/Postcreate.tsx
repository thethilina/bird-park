"use client";
import React, { useState, useRef, ChangeEvent } from "react";
import { IoCloudUpload, IoClose } from "react-icons/io5";
import { useTopLoader } from "nextjs-toploader";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { MdCancel } from "react-icons/md";




type PostType = "art" | "poem";

interface PostCreateProps {
  /** The circle this post is being created in */
  circleId: string;
  postCreateOpen : (isOpen: boolean) => void;
}

const fontOptions = [
  { name: "Georgia", value: "Georgia, serif" },
  {
    name: "Palatino",
    value:
      '"Palatino Linotype", Palatino, Palladio, "URW Palladio L", serif',
  },
  {
    name: "Garamond",
    value:
      'Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", serif',
  },
  {
    name: "Bookman",
    value: '"Bookman Old Style", Bookman, "URW Bookman L", serif',
  },
  {
    name: "Times New Roman",
    value: '"Times New Roman", Times, Baskerville, Georgia, serif',
  },
  {
    name: "Helvetica",
    value: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  { name: "Arial", value: "Arial, Helvetica, sans-serif" },
  { name: "Verdana", value: "Verdana, Geneva, sans-serif" },
  {
    name: "Trebuchet MS",
    value: '"Trebuchet MS", Helvetica, jam, sans-serif',
  },
  {
    name: "Gill Sans",
    value: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif',
  },
  {
    name: "Optima",
    value: 'Optima, Segoe, "Segoe UI", Candara, Calibri, sans-serif',
  },
  {
    name: "Century Gothic",
    value: '"Century Gothic", CenturyGothic, AppleGothic, sans-serif',
  },
  { name: "Courier New", value: '"Courier New", Courier, monospace' },
  {
    name: "Lucida Sans Typewriter",
    value: '"Lucida Sans Typewriter", "Lucida Console", Monaco, monospace',
  },
  { name: "Consolas", value: "Consolas, monaco, monospace" },
  {
    name: "Copperplate",
    value: 'Copperplate, "Copperplate Gothic Light", fantasy',
  },
  { name: "Papyrus", value: "Papyrus, fantasy" },
  { name: "Brush Script", value: '"Brush Script MT", cursive' },
  { name: "Comic Sans", value: '"Comic Sans MS", cursive, sans-serif' },
  {
    name: "Impact",
    value: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
  },
  { name: "Lucida Handwriting", value: '"Lucida Handwriting", cursive' },
];

const sizeOptions = [
  { name: "Small", value: "14px" },
  { name: "Normal", value: "16px" },
  { name: "Large", value: "20px" },
  { name: "XL", value: "24px" },
  { name: "2XL", value: "32px" },
  { name: "3XL", value: "40px" },
];

function PostCreate({ circleId , postCreateOpen }: PostCreateProps) {
  const [postType, setPostType] = useState<PostType>("art");

  // shared
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("Circle only");
  const [uploading, setUploading] = useState(false);

  // art state
  const [art, setArt] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // poem state
  const [poem, setPoem] = useState("");
  const [font, setFont] = useState("Georgia, serif");
  const [fontSize, setFontSize] = useState("20px");
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  const loader = useTopLoader();
  const { user } = useAuth();
  const router = useRouter();

  // NOTE: adjust this to match your actual route file location
  // (matches the POST handler you shared: params -> { circleId })
  const postEndpoint = `/api/circles/${circleId}/posts`;

  const success = (msg: string) =>
    toast(msg, { position: "top-right", autoClose: 2000, type: "success" });

  const errorToast = (msg: string) =>
    toast(msg, { position: "top-right", autoClose: 2000, type: "error" });

  const resetForm = () => {
    setTitle("");
    setVisibility("Circle only");
    setArt(null);
    setFile(null);
    setPoem("");
    setFont("Georgia, serif");
    setFontSize("20px");
    setTextColor("#000000");
    setBgColor("#ffffff");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---------- shared emotion analysis ----------
const analyzeArtEmotion = async (
  postId: string,
  file: File
) => {
  try {
    // --------------------------------------------------------
    // Mark analysis as processing
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // Prepare artwork
    // --------------------------------------------------------

    const formData = new FormData();

    formData.append("image", file);

    // --------------------------------------------------------
    // Send artwork to Paint AI
    // --------------------------------------------------------

    const response = await fetch(
      "/api/emotion/art",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(
        "Artwork AI analysis failed"
      );
    }

    const data = await response.json();

    console.log(
      "Artwork AI result:",
      data
    );

    // --------------------------------------------------------
    // Extract semantic analysis
    // --------------------------------------------------------

    const analysis =
      data?.analysis;

    if (!analysis) {
      throw new Error(
        "Invalid artwork AI response"
      );
    }

    const {
      story,
      cluster,
      matching,
    } = analysis;

    if (
      !story ||
      !cluster ||
      !matching
    ) {
      throw new Error(
        "Incomplete artwork AI response"
      );
    }

    // --------------------------------------------------------
    // Save semantic analysis
    // --------------------------------------------------------

    const updateResponse = await fetch(
      `/api/post/${postId}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          semanticAnalysis: {
            story,

            cluster,

            matching: {
              cluster:
                matching.cluster,

              embedText:
                matching.embed_text,

              // Actual embedding will be
              // generated by the embedding module later.
              embedding: [],
            },
          },

          emotionAnalysis: {
            status: "completed",

            completedAt:
              new Date(),
          },
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(
        "Failed to save artwork AI analysis"
      );
    }

    console.log(
      "Artwork semantic analysis completed."
    );

  } catch (err) {

    console.error(
      "[ART_ANALYSIS_ERROR]",
      err
    );

    // --------------------------------------------------------
    // Mark analysis as failed
    // --------------------------------------------------------

    try {
      await fetch(
        `/api/post/${postId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            emotionAnalysis: {
              status: "failed",

              completedAt: null,
            },
          }),
        }
      );
    } catch (statusError) {

      console.error(
        "Failed to update analysis status:",
        statusError
      );
    }
  }
};


const analyzePoemEmotion = async (
  postId: string,
  poemText: string
) => {
  try {
    // --------------------------------------------------------
    // Mark analysis as processing
    // --------------------------------------------------------

    await fetch(
      `/api/post/${postId}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          emotionAnalysis: {
            status: "processing",
          },
        }),
      }
    );

    // --------------------------------------------------------
    // Send poem to Poem AI
    // --------------------------------------------------------

    const response = await fetch(
      "/api/emotion/poem",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          poem: poemText,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Poem AI analysis failed"
      );
    }

    const data =
      await response.json();

    console.log(
      "Poem AI result:",
      data
    );

    // --------------------------------------------------------
    // Extract semantic analysis
    // --------------------------------------------------------

    const analysis =
      data?.analysis;

    if (!analysis) {
      throw new Error(
        "Invalid poem AI response"
      );
    }

    const {
      story,
      cluster,
      matching,
    } = analysis;

    if (
      !story ||
      !cluster ||
      !matching
    ) {
      throw new Error(
        "Incomplete poem AI response"
      );
    }

    // --------------------------------------------------------
    // Save semantic analysis
    // --------------------------------------------------------

    const updateResponse = await fetch(
      `/api/post/${postId}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          semanticAnalysis: {
            story,

            cluster,

            matching: {
              cluster:
                matching.cluster,

              embedText:
                matching.embed_text,

              // Actual embedding will be
              // generated later.
              embedding: [],
            },
          },

          emotionAnalysis: {
            status: "completed",

            completedAt:
              new Date(),
          },
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(
        "Failed to save poem AI analysis"
      );
    }

    console.log(
      "Poem semantic analysis completed."
    );

  } catch (err) {

    console.error(
      "[POEM_ANALYSIS_ERROR]",
      err
    );

    // --------------------------------------------------------
    // Mark analysis as failed
    // --------------------------------------------------------

    try {
      await fetch(
        `/api/post/${postId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            emotionAnalysis: {
              status: "failed",

              completedAt: null,
            },
          }),
        }
      );
    } catch (statusError) {

      console.error(
        "Failed to update analysis status:",
        statusError
      );
    }
  }
};

  // ---------- art handlers ----------
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setArt(URL.createObjectURL(selectedFile));
  };

  const handleUploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) return data.url;
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleIconClick = () => fileInputRef.current?.click();

  const handleRemoveArt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setArt(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleArtClick = () => setIsFullScreen(true);

  // ---------- submit ----------
  const handleUpload = async () => {
    if (!title.trim()) {
      errorToast("Please enter a title");
      return;
    }

    if (postType === "art") {
      if (!file) {
        errorToast("Please select an artwork");
        return;
      }
    } else {
      if (!poem.trim()) {
        errorToast("Please write your poem");
        return;
      }
    }

    try {
      loader.start();
      setUploading(true);

      let payload: any = {
        title,
        type: postType,
        visibility,
      };

      if (postType === "art") {
        const imageUrl = await handleUploadFile(file as File);
        if (!imageUrl) throw new Error("Image upload failed");
        payload.media = { url: imageUrl };
      } else {
        payload.body = poem;
        payload.poemStyle = {
          fontFamily: font,
          fontSize,
          fontColor: textColor,
          backgroundColor: bgColor,
        };
      }

      const res = await fetch(postEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (postType === "art") {
        analyzeArtEmotion(data.post._id, file as File);
      } else {
        analyzePoemEmotion(data.post._id, poem);
      }

      success(
        postType === "art"
          ? "Artwork uploaded successfully!"
          : "Poem uploaded successfully!"
      );

      resetForm();
      loader.done();

      setTimeout(() => {
        router.push(`/Profile/${user?._id}`);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      loader.done();
      errorToast(err.message || "Failed to upload post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-10 my-5">
      {/* Type switcher */}
      <div className="flex items-center justify-between gap-2 mb-5">
        <div className="flex gap-2 items-center">
        <button
          onClick={() => setPostType("art")}
          className={`px-5 py-2 rounded-full text-lg font-bold transition-colors hover:cursor-pointer ${
            postType === "art"
              ? "bg-[#e6f0f0] text-[#141414]"
              : "border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark)"
          }`}
        >
          Art
        </button>
        <button
          onClick={() => setPostType("poem")}
          className={`px-5 py-2 rounded-full text-lg font-bold transition-colors hover:cursor-pointer ${
            postType === "poem"
              ? "bg-[#192942] text-white"
              : "border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark)"
          }`}
        >
          Poem
        </button>
          </div>
        <MdCancel onClick={() => postCreateOpen(false)} size={25} className="hover:cursor-pointer hover:scale-110 transition-transform" />

      </div>

      {/* Title + Visibility */}
      <div className="flex flex-col md:flex-row gap-4 mb-5">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) px-4 py-2 text-2xl dark:bg-(--colorbgdark)"
        />

      
      </div>

      {postType === "art" ? (
        <>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {art === null ? (
            <div
              onClick={handleIconClick}
              className="hover:cursor-pointer w-full text-xl gap-y-3 items-center justify-center flex flex-col h-130 rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark)"
            >
              <IoCloudUpload size={40} />
              <p>Upload your art</p>
            </div>
          ) : (
            <div className="relative w-full text-xl gap-y-3 items-center justify-center flex flex-col h-130 rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark)">
              <button
                onClick={handleRemoveArt}
                className="absolute top-2 hover:cursor-pointer right-2 z-10 flex items-center justify-center rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              >
                <IoClose size={20} />
              </button>
              <img
                src={art}
                alt="uploadedart"
                onClick={handleArtClick}
                className="w-full h-full object-contain object-center hover:cursor-pointer"
                style={{ backgroundColor: "transparent", borderRadius: "0px" }}
              />
            </div>
          )}
        </>
      ) : (
        <>
          {/* Poem toolbar */}
          <div className="mb-5 w-full rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) px-4 py-2 dark:bg-(--colorbgdark) flex flex-wrap items-center gap-4 text-base">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Font:</label>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="p-1 text-sm border rounded bg-transparent border-(--border) dark:text-white text-black"
              >
                {fontOptions.map((f, idx) => (
                  <option key={idx} value={f.value} className="text-black">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Size:</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="p-1 text-sm border rounded bg-transparent border-(--border) dark:text-white text-black"
              >
                {sizeOptions.map((s, idx) => (
                  <option key={idx} value={s.value} className="text-black">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Text:</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-6 h-6 border rounded cursor-pointer border-(--border)"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Bg:</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-6 h-6 border rounded cursor-pointer border-(--border)"
              />
            </div>
          </div>

          {/* Poem editor */}
          <div
            className="w-full gap-y-3 items-center justify-center flex flex-col h-130 rounded-xl border-2 border-dotted border-(--border) p-4"
            style={{ backgroundColor: bgColor }}
          >
            <textarea
              placeholder="Write your poem here..."
              value={poem}
              onChange={(e) => setPoem(e.target.value)}
              className="w-full h-full bg-transparent border-none outline-none resize-none text-left p-2"
              style={{ fontFamily: font, fontSize: fontSize, color: textColor }}
            />
          </div>
        </>
      )}

      <div className="flex items-center justify-end w-full p-2 mt-4 text-right">
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-4 text-[#141414] py-2 bg-[#e6f0f0] text-lg rounded-4xl hover:cursor-pointer hover:bg-[#979ea0] font-bold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Fullscreen art preview */}
      {isFullScreen && art && (
        <div
          onClick={() => setIsFullScreen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <button
            onClick={() => setIsFullScreen(false)}
            className="absolute top-4 right-4 z-10 flex items-center justify-center rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
          >
            <IoClose size={28} />
          </button>
          <img
            src={art}
            alt="uploadedart-fullscreen"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default PostCreate;