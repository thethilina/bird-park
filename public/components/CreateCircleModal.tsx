"use client";

import React, { useState, useRef } from "react";
import { IoClose, IoImageOutline, IoAdd, IoTrashOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { useTopLoader } from "nextjs-toploader";
import { useRouter } from "next/navigation";

interface Rule {
  title: string;
  description: string;
}

interface CreateCircleModalProps {
  onClose: () => void;
  onSuccess?: (circle: any) => void;
}

const CATEGORIES = [
  "Visual Art",
  "Poetry",
  "Music",
  "Photography",
  "Digital Art",
  "Writing",
  "3D & Animation",
  "General",
];

export default function CreateCircleModal({
  onClose,
  onSuccess,
}: CreateCircleModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Visual Art");
  const [joinType, setJoinType] = useState<"open" | "approval">("open");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Rules management
  const [rules, setRules] = useState<Rule[]>([]);
  const [ruleTitle, setRuleTitle] = useState("");
  const [ruleDesc, setRuleDesc] = useState("");
  
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loader = useTopLoader();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddRule = () => {
    if (!ruleTitle.trim()) {
      toast.error("Rule title cannot be empty", { position: "top-right" });
      return;
    }
    setRules([...rules, { title: ruleTitle.trim(), description: ruleDesc.trim() }]);
    setRuleTitle("");
    setRuleDesc("");
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleCreateCircle = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name for your circle.", { position: "top-right" });
      return;
    }

    try {
      loader.start();
      setCreating(true);

      let imageUrl = "";

      // Step 1: Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          imageUrl = uploadData.url;
        } else {
          toast.error("Failed to upload circle cover image.", { position: "top-right" });
          loader.done();
          setCreating(false);
          return;
        }
      }

      // Step 2: Create Circle backend API call
      const res = await fetch("/api/circles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          image: imageUrl || undefined,
          joinType,
          category,
          rules,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to create circle.", { position: "top-right" });
        loader.done();
        setCreating(false);
        return;
      }

      toast.success("Circle created successfully!", { position: "top-right" });
      loader.done();
      setCreating(false);

      if (onSuccess) {
        onSuccess(data.circle);
      }
      
      onClose();
      router.push(`/Circle/${data.circle._id}`);
    } catch (err) {
      console.error("Circle creation error:", err);
      toast.error("Something went wrong.", { position: "top-right" });
      loader.done();
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-white text-left overflow-y-auto">
      <div className="bg-[#0e0e14] border border-(--border) dark:border-(--borderdark) rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 relative max-h-[90vh] overflow-y-auto my-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-(--text-muted) hover:text-white transition-colors cursor-pointer"
        >
          <IoClose size={22} />
        </button>

        <h2 className="text-2xl font-bold">Create a Circle</h2>

        <div className="space-y-4">
          {/* Cover Image Picker */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Circle Image / Cover
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-36 rounded-xl border-2 border-dashed border-gray-700 bg-[#131e2e] flex flex-col items-center justify-center cursor-pointer hover:bg-[#1c2b42] transition-colors overflow-hidden relative"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Circle Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <IoImageOutline size={32} className="mb-2" />
                  <span className="text-sm">Click to upload circle image</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          {/* Circle Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Circle Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Surrealist Painters Club"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-[#131e2e] outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-[#131e2e] outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0e0e14]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Join Type */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Privacy / Access
            </label>
            <div className="flex gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="joinType"
                  value="open"
                  checked={joinType === "open"}
                  onChange={() => setJoinType("open")}
                  className="accent-blue-500"
                />
                <span className="text-sm text-gray-200">Open (Anyone can join)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="joinType"
                  value="approval"
                  checked={joinType === "approval"}
                  onChange={() => setJoinType("approval")}
                  className="accent-blue-500"
                />
                <span className="text-sm text-gray-200">Approval Required</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose, themes, or vibe of this circle..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-[#131e2e] outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none text-white text-sm"
            />
          </div>

          {/* Circle Rules */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Community Rules (Optional)
            </label>
            {rules.length > 0 && (
              <div className="space-y-2 mb-3">
                {rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between bg-[#131e2e] p-2.5 rounded-lg border border-gray-800"
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-blue-400">
                        {idx + 1}. {rule.title}
                      </h4>
                      {rule.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{rule.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="text-gray-400 hover:text-red-400 transition-colors p-1"
                    >
                      <IoTrashOutline size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 bg-[#131e2e]/50 p-3 rounded-xl border border-gray-800">
              <input
                type="text"
                value={ruleTitle}
                onChange={(e) => setRuleTitle(e.target.value)}
                placeholder="Rule title (e.g. Be respectful)"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-700 bg-[#131e2e] text-xs outline-none text-white"
              />
              <input
                type="text"
                value={ruleDesc}
                onChange={(e) => setRuleDesc(e.target.value)}
                placeholder="Optional rule description"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-700 bg-[#131e2e] text-xs outline-none text-white"
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="flex items-center justify-center gap-1 py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-medium transition-colors self-end"
              >
                <IoAdd size={14} /> Add Rule
              </button>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-700 hover:bg-gray-800 transition-colors text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateCircle}
            disabled={creating}
            className="px-6 py-2 rounded-xl bg-[#3B5D95] hover:bg-[#2e4a7a] text-white font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {creating ? "Creating..." : "Create Circle"}
          </button>
        </div>
      </div>
    </div>
  );
}
