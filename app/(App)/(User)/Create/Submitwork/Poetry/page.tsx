"use client";

import React, { useState, useEffect } from "react";
import { IoCloudUpload } from "react-icons/io5";
import { useTopLoader } from "nextjs-toploader";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

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
        headers: { "Content-Type": "application/json" },
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
        errorToast(data.message || "Failed to upload poem.");
        loader.done();
        setUploading(false);
        return;
      }

      successToast("Poem uploaded successfully!");
      loader.done();
      setTimeout(() => router.push(`/Profile/${user?._id}`), 1500);
    } catch {
      errorToast("Something went wrong.");
      loader.done();
      setUploading(false);
    }
  };

  return (
    <div className="">

      {/* Title */}
      <div className="w-full mb-3">
        <input
          type="text"
          placeholder="Poem Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-2 py-1 text-2xl font-semibold bg-transparent border-b outline-none border-(--border)"
        />
      </div>

      {/* Toolbar */}
      <div className="mb-5 w-full rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) px-4 py-2 text-2xl dark:bg-(--colorbgdark) flex flex-wrap items-center gap-4 text-base">
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

        {/* Collection picker */}
        {collections.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Collection:</label>
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="p-1 text-sm border rounded bg-transparent border-(--border) dark:text-white text-black"
              >
                <option value="">None</option>
                {collections.map((c) => (
                  <option key={c._id} value={c._id} className="text-black">
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Visibility:</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="p-1 text-sm border rounded bg-transparent border-(--border) dark:text-white text-black"
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

      {/* Poem Editor */}
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

      {/* Buttons */}
      <div className="flex items-center justify-end w-full p-2 mt-4 text-right gap-3">
        <button
          disabled={uploading}
          className="mr-3 px-4 py-2 opacity-60 cursor-not-allowed"
        >
          Draft
        </button>
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-6 py-2 font-bold bg-[#192942] hover:bg-[#2c456e] text-white rounded-xl flex items-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <IoCloudUpload />
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

export default Page;