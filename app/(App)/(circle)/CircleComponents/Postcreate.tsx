"use client";
import React, { useState, useRef, ChangeEvent } from "react";
import { IoCloudUpload, IoClose } from "react-icons/io5";
import { useTopLoader } from "nextjs-toploader";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { MdCancel } from "react-icons/md";
import { analyzeArtEmotion, analyzePoemEmotion } from "@/lib/analyzeEmotion";




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
        await analyzeArtEmotion(data.post._id, file as File);
      } else {
        await analyzePoemEmotion(data.post._id, poem);
      }

      success(
        postType === "art"
          ? "Artwork uploaded successfully!"
          : "Poem uploaded successfully!"
      );

      resetForm();
      loader.done();

      router.push(`/Profile/${user?._id}`);
    } catch (err: any) {
      console.error(err);
      loader.done();
      errorToast(err.message || "Failed to upload post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-4 sm:mx-6 lg:mx-10 my-5 max-w-full overflow-x-hidden">
      {/* Type switcher */}
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setPostType("art")}
            className={`py-1 px-3 sm:px-5 sm:py-2 rounded-full text-base sm:text-lg font-bold transition-colors hover:cursor-pointer ${
              postType === "art"
                ? "bg-[#e6f0f0] text-[#141414]"
                : "border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark)"
            }`}
          >
            Art
          </button>
          <button
            onClick={() => setPostType("poem")}
            className={`py-1 px-3 sm:px-5 sm:py-2 rounded-full text-base sm:text-lg font-bold transition-colors hover:cursor-pointer ${
              postType === "poem"
                ? "bg-[#192942] text-white"
                : "border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark)"
            }`}
          >
            Poem
          </button>
        </div>
        <MdCancel onClick={() => postCreateOpen(false)} size={25} className="hover:cursor-pointer hover:scale-110 transition-transform shrink-0" />
      </div>

      {/* Title + Visibility */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4 sm:mb-5">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-0 rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) px-3 sm:px-4 py-2 text-lg sm:text-2xl dark:bg-(--colorbgdark)"
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
              className="hover:cursor-pointer w-full text-base sm:text-xl gap-y-2 sm:gap-y-3 items-center justify-center flex flex-col h-64 sm:h-96 md:h-130 rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark)"
            >
              <IoCloudUpload size={32} className="sm:w-10 sm:h-10" />
              <p>Upload your art</p>
            </div>
          ) : (
            <div className="relative w-full text-base sm:text-xl gap-y-2 sm:gap-y-3 items-center justify-center flex flex-col h-64 sm:h-96 md:h-130 rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark)">
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
          <div className="mb-4 sm:mb-5 w-full rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) px-3 py-3 sm:px-4 sm:py-2 dark:bg-(--colorbgdark) text-sm sm:text-base">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
              <div className="flex flex-col gap-1 min-w-0 sm:flex-row sm:items-center sm:gap-2">
                <label className="text-xs sm:text-sm font-medium">Font</label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  className="w-full p-1.5 sm:p-1 text-xs sm:text-sm border rounded bg-transparent border-(--border) dark:text-white text-black min-w-0"
                >
                  {fontOptions.map((f, idx) => (
                    <option key={idx} value={f.value} className="text-black">
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 min-w-0 sm:flex-row sm:items-center sm:gap-2">
                <label className="text-xs sm:text-sm font-medium">Size</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full p-1.5 sm:p-1 text-xs sm:text-sm border rounded bg-transparent border-(--border) dark:text-white text-black min-w-0"
                >
                  {sizeOptions.map((s, idx) => (
                    <option key={idx} value={s.value} className="text-black">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2 col-span-2 min-w-0">
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-xs sm:text-sm font-medium">Text</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-7 h-7 sm:w-6 sm:h-6 border rounded cursor-pointer border-(--border) p-0 shrink-0 appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-xs sm:text-sm font-medium">Bg</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 sm:w-6 sm:h-6 border rounded cursor-pointer border-(--border) p-0 shrink-0 appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Poem editor */}
          <div
            className="w-full gap-y-3 items-center justify-center flex flex-col h-64 sm:h-96 md:h-130 rounded-xl border-2 border-dotted border-(--border) p-3 sm:p-4"
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

      <div className="flex items-center justify-center sm:justify-end w-full p-2 mt-4 text-right">
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full sm:w-auto px-4 text-[#141414] py-2 bg-[#e6f0f0] text-lg rounded-4xl hover:cursor-pointer hover:bg-[#979ea0] font-bold disabled:opacity-60 disabled:cursor-not-allowed"
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