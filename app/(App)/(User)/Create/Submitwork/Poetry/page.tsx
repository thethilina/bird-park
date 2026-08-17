"use client";
import React, { useState, useEffect } from "react";
import { IoCloudUpload } from "react-icons/io5";
import { useTopLoader } from "nextjs-toploader";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import CreateCollectionModal from "@/public/components/CreateCollectionModal";
import { analyzePoemEmotion } from "@/lib/analyzeEmotion";

function Page() {
  const [title, setTitle] = useState("");
  const [poem, setPoem] = useState("");
  const [font, setFont] = useState("Georgia, serif");
  const [fontSize, setFontSize] = useState("20px");
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [visibility, setVisibility] = useState("public");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [collections, setCollections] = useState<any[]>([]);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loader = useTopLoader();
  const { user } = useAuth();
  const router = useRouter();

  const successToast = (msg: string) =>
    toast(msg, { position: "top-right", autoClose: 3000, type: "success" });
  const errorToast = (msg: string) =>
    toast(msg, { position: "top-right", autoClose: 3000, type: "error" });

  useEffect(() => {
    const fetchCollections = async () => {
      if (!user?._id) return;
      try {
        const res = await fetch(`/api/collections/user/${user._id}`);
        const data = await res.json();
        if (data.success) setCollections(data.collections);
      } catch {}
    };
    fetchCollections();
  }, [user?._id]);

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
    {
      name: "Consolas",
      value: "Consolas, monaco, monospace",
    },
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



  const handleUpload = async () => {
    if (!title.trim()) {
      errorToast("Please enter a title.");
      return;
    }

    if (!poem.trim()) {
      errorToast("Please write your poem.");
      return;
    }

    try {
      loader.start();
      setUploading(true);

      const res = await fetch("/api/post/poem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          body: poem,
          poemStyle: {
            fontFamily: font,
            fontSize,
            fontColor: textColor,
            backgroundColor: bgColor,
          },
          collection: selectedCollection || undefined,
          visibility,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      await analyzePoemEmotion(data.post._id, poem);

      successToast("Poem uploaded successfully!");

      loader.done();

      router.push(`/Profile/${user?._id}`);
    } catch (err: any) {
      console.error(err);

      loader.done();

      errorToast(err.message || "Failed to upload poem.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="px-3 sm:px-0 max-w-full overflow-x-hidden pb-15">
      {/* Title */}
      <div className="w-full mb-3">
        <input
          type="text"
          placeholder="Poem Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-2 py-1 text-lg sm:text-2xl font-semibold bg-transparent border-b outline-none border-(--border)"
        />
      </div>

      {/* Toolbar */}
      <div className="mb-4 sm:mb-5 w-full rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) px-3 py-3 sm:px-4 sm:py-2 dark:bg-(--colorbgdark) text-sm sm:text-base">
        {/* Row 1 on mobile: Font + Size share the row, grid on mobile so they never overflow */}
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

          {/* Text / Bg colors: paired on mobile so they sit on their own compact row.
              FIX: flex-wrap + min-w-0 so this row can never force the page wider
              than the viewport on small screens. */}
          <div className="flex flex-wrap items-center gap-2 col-span-2 sm:col-span-1 min-w-0">
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

            <div className="flex items-center gap-2 min-w-0 sm:hidden">
              <label className="text-xs font-medium whitespace-nowrap">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="p-1.5 text-xs border rounded bg-transparent border-(--border) dark:text-white text-black min-w-0 flex-1"
              >
                <option value="public" className="text-black">
                  Public
                </option>
                <option value="circle" className="text-black">
                  Circle only
                </option>
              </select>
            </div>
          </div>

          {/* Visibility: hidden here on mobile (rendered above), shown normally on sm+ */}
          <div className="hidden sm:flex items-center gap-2">
            <label className="text-xs sm:text-sm font-medium">Visibility:</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="p-1 text-xs sm:text-sm border rounded bg-transparent border-(--border) dark:text-white text-black"
            >
              <option value="public" className="text-black">
                Public
              </option>
              <option value="circle" className="text-black">
                Circle only
              </option>
            </select>
          </div>
        </div>

        {/* Collection picker: always its own full-width row for room to breathe */}
        <div className="flex flex-wrap items-center gap-2 w-full min-w-0 mt-3 pt-3 border-t border-dotted border-(--border) sm:mt-2 sm:pt-2">
          <label className="text-xs sm:text-sm font-medium whitespace-nowrap shrink-0">Collection:</label>
          <div className="flex items-center gap-2 border border-(--border) rounded bg-transparent p-1.5 sm:p-1 flex-1 min-w-0">
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="text-xs sm:text-sm bg-transparent outline-none dark:text-white text-black min-w-0 flex-1"
            >
              <option value="">None</option>
              {collections.map((c) => (
                <option key={c._id} value={c._id} className="text-black">
                  {c.title}
                </option>
              ))}
            </select>
            <div className="w-[1px] h-4 bg-(--border) shrink-0"></div>
            <button
              onClick={() => setShowCreateCollectionModal(true)}
              className="text-xs sm:text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors px-1 whitespace-nowrap flex items-center gap-1 shrink-0"
              title="Create new collection"
            >
              <span className="text-base leading-none">+</span> New
            </button>
          </div>
        </div>
      </div>

      {/* Poem Editor */}
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

      {/* Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end w-full p-2 mt-4 text-right gap-3">
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full sm:w-auto justify-center px-6 py-2 font-bold bg-[#192942] hover:bg-[#2c456e] text-white rounded-xl flex items-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <IoCloudUpload />
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {showCreateCollectionModal && (
        <CreateCollectionModal
          onClose={() => setShowCreateCollectionModal(false)}
          onSuccess={(newCollection) => {
            setCollections([newCollection, ...collections]);
            setSelectedCollection(newCollection._id);
            setShowCreateCollectionModal(false);
          }}
        />
      )}
    </div>
  );
}

export default Page;