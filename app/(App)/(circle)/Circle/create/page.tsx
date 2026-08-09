"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTopLoader } from "nextjs-toploader";
import {
  IoImageOutline,
  IoAdd,
  IoTrashOutline,
  IoChevronForward,
  IoChevronBack,
  IoCheckmarkCircle,
  IoPersonCircleOutline,
} from "react-icons/io5";
import { FiUploadCloud } from "react-icons/fi";
import Link from "next/link";
import { MdOutlinePublic } from "react-icons/md";
import { MdPublicOff } from "react-icons/md";



interface Rule {
  title: string;
  description: string;
}

const CATEGORIES = [
  { value: "Visual Art", emoji: "" },
  { value: "Poetry", emoji: "" },
  { value: "Music", emoji: "" },
  { value: "Digital Art", emoji: "" },
  { value: "Writing", emoji: "" },
  { value: "3D Art", emoji: "" },
  { value: "General", emoji: "" },
];

const STEP_LABELS = ["Identity", "Details", "Rules", "Review"];

export default function CreateCirclePage() {
  const router = useRouter();
  const loader = useTopLoader();

  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);

  // Step 1 — Identity
  const [name, setName] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Step 2 — Details
  const [category, setCategory] = useState("Visual Art");
  const [joinType, setJoinType] = useState<"open" | "approval">("open");
  const [description, setDescription] = useState("");

  // Step 3 — Rules
  const [rules, setRules] = useState<Rule[]>([]);
  const [ruleTitle, setRuleTitle] = useState("");
  const [ruleDesc, setRuleDesc] = useState("");

  const iconInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ─── File helpers ───────────────────────────────────────────────────────────
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!data.success) throw new Error("Upload failed");
    return data.url;
  };

  // ─── Rules ──────────────────────────────────────────────────────────────────
  const handleAddRule = () => {
    if (!ruleTitle.trim()) {
      toast.error("Rule title cannot be empty");
      return;
    }
    setRules([...rules, { title: ruleTitle.trim(), description: ruleDesc.trim() }]);
    setRuleTitle("");
    setRuleDesc("");
  };

  const handleRemoveRule = (i: number) => {
    setRules(rules.filter((_, idx) => idx !== i));
  };

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const canGoNext = () => {
    if (step === 0) return name.trim().length > 0;
    return true;
  };

  const next = () => {
    if (!canGoNext()) {
      toast.error("Please enter a circle name to continue.");
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Circle name is required.");
      return;
    }

    try {
      loader.start();
      setCreating(true);

      let imageUrl = "";
      let iconUrl = "";

      if (coverFile) {
        imageUrl = await uploadFile(coverFile);
      }
      if (iconFile) {
        iconUrl = await uploadFile(iconFile);
      }

      const res = await fetch("/api/circles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          image: imageUrl || undefined,
          icon: iconUrl || undefined,
          joinType,
          category,
          rules,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to create circle.");
        return;
      }

      toast.success("Circle created! ");
      router.push(`/Circle/${data.circle._id}`);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      loader.done();
      setCreating(false);
    }
  };

  return (
    <div className=" mx-30 my-10 flex flex-col items-center justify-start  px-4 bg-[#06060B] text-white">
      {/* Header */}
      <div className="w-full  mb-8">
   
        <h1 className="text-3xl font-bold">Create a Circle</h1>
        <p className="text-gray-500 mt-1 text-xl">
          Build a community around your art, share work, and grow together.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="w-full  mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10 -translate-y-1/2 z-0" />
          <div
            className="absolute left-0 top-1/2 h-px bg-white -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex flex-col items-center z-10 gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i < step
                    ? "bg-white text-black"
                    : i === step
                    ? "bg-white text-black ring-4 ring-white/10 scale-110"
                    : "bg-[#06060B] border border-white/20 text-gray-500"
                }`}
              >
                {i < step ? <IoCheckmarkCircle size={14} /> : i + 1}
              </div>
              <span
                className={`text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                  i <= step ? "text-white" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="w-full  bg-[#141414] border-2 rounded-xl border-white/10 overflow-hidden">
        {/* Step 0 — Identity */}
        {step === 0 && (
          <div className="p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-1 text-white">Circle Identity</h2>
              <p className="text-lg text-gray-400">Set a name, icon and cover photo for your circle.</p>
            </div>

            {/* Cover Photo */}
            <div>
              <label className="block text-xl font-semibold mb-3 text-gray-300">Cover Photo</label>
              <div
                onClick={() => coverInputRef.current?.click()}
                className="relative w-full h-48 rounded-xl border-2 border-dashed border-white/20 bg-[#1E1E1E] flex flex-col items-center justify-center cursor-pointer hover:border-white/40 hover:bg-[#1f1f1f] transition-all overflow-hidden group"
              >
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FiUploadCloud size={24} className="text-white" />
                      <span className="text-white text-sm ml-2">Change cover</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
                    <IoImageOutline size={32} />
                    <span className="text-sm font-medium">Upload cover photo</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" ref={coverInputRef} onChange={handleCoverChange} className="hidden" />
            </div>

            {/* Icon + Name row */}
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Icon picker */}
              <div className="flex flex-col items-start gap-2 flex-shrink-0">
                <label className="block text-xl font-semibold text-gray-300">Icon</label>
                <div
                  onClick={() => iconInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-white/20 bg-[#1E1E1E] flex flex-col items-center justify-center cursor-pointer hover:border-white/40 hover:bg-[#2A2A2A] transition-all overflow-hidden group relative"
                >
                  {iconPreview ? (
                    <>
                      <img src={iconPreview} alt="Icon" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <FiUploadCloud size={18} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-gray-300 transition-colors">
                      <IoPersonCircleOutline size={28} />
                      <span className="text-[10px] text-center uppercase tracking-wide">Add Icon</span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" ref={iconInputRef} onChange={handleIconChange} className="hidden" />
              </div>

              {/* Name */}
              <div className="flex-1 w-full">
                <label className="block text-xl font-semibold mb-2 text-gray-300">
                  Circle Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Surrealist Painters Guild"
                  maxLength={60}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#1E1E1E] outline-none focus:border-white/30 transition-all text-white text-base font-medium placeholder-gray-600"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-600">{name.length}/60</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — Details */}
        {step === 1 && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1 text-white">Circle Details</h2>
              <p className="text-lg text-gray-400">Choose a category, privacy setting, and describe your circle.</p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-gray-300">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                      category === cat.value
                        ? "border-white bg-white/10 text-white"
                        : "border-white/10 bg-[#1E1E1E] hover:border-white/30 text-gray-400"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span className="truncate">{cat.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Join Type */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-gray-300">Privacy & Access</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: "open" as const, label: "Open", desc: "Anyone can join instantly", icon: <MdOutlinePublic /> },
                  { val: "approval" as const, label: "Approval Required", desc: "Members need admin approval", icon: <MdPublicOff /> },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setJoinType(opt.val)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      joinType === opt.val
                        ? "border-white bg-white/10"
                        : "border-white/10 bg-[#1E1E1E] hover:border-white/30"
                    }`}
                  >
                    <div className="text-xl mb-2">{opt.icon}</div>
                    <div className={`text-sm font-semibold ${joinType === opt.val ? "text-white" : "text-gray-300"}`}>
                      {opt.label}
                    </div>
                    <div className="text-lg text-gray-500 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose, themes, or vibe of this circle..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#1E1E1E] outline-none focus:border-white/30 transition-all resize-none text-white text-lg placeholder-gray-600"
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-600">{description.length}/500</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Rules */}
        {step === 2 && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1 text-white">Community Rules</h2>
              <p className="text-lg text-gray-400">Optional — set rules to guide behavior in your circle.</p>
            </div>

            {rules.length > 0 && (
              <div className="space-y-3">
                {rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start justify-between bg-[#1E1E1E] p-4 rounded-xl border border-white/10">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center text-lg font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold text-lg text-gray-200">{rule.title}</h4>
                        {rule.description && <p className="text-lg text-gray-400 mt-1">{rule.description}</p>}
                      </div>
                    </div>
                    <button onClick={() => handleRemoveRule(idx)} className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer p-1">
                      <IoTrashOutline size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-[#1E1E1E] p-5 rounded-xl border border-white/10 space-y-3">
              <p className="text-md font-bold text-gray-500 uppercase tracking-wider">Add a Rule</p>
              <input
                type="text"
                value={ruleTitle}
                onChange={(e) => setRuleTitle(e.target.value)}
                placeholder="Rule title (e.g. Be respectful)"
                className="w-full px-3 py-2 rounded-lg border border-white/5 bg-[#141414] text-lg outline-none focus:border-white/30 text-white placeholder-gray-600"
              />
              <input
                type="text"
                value={ruleDesc}
                onChange={(e) => setRuleDesc(e.target.value)}
                placeholder="Optional description"
                className="w-full px-3 py-2 rounded-lg border border-white/5 bg-[#141414] text-lg outline-none focus:border-white/30 text-white placeholder-gray-600"
              />
              <button
                onClick={handleAddRule}
                className="flex items-center gap-1.5 py-2 px-4 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <IoAdd size={14} /> Add Rule
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1 text-white">Review & Create</h2>
              <p className="text-lg text-gray-400">Everything look good? Hit create to launch your circle.</p>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#1E1E1E]">
              <div className="relative h-32 bg-[#2A2A2A]">
                {coverPreview && <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />}
                <div className="absolute -bottom-6 left-6">
                  <div className="w-16 h-16 rounded-xl border-4 border-[#1E1E1E] bg-[#141414] overflow-hidden">
                    {iconPreview ? (
                      <img src={iconPreview} alt="Icon" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white">
                        {name?.[0]?.toUpperCase() || "C"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-10 pb-5 px-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{name || "Unnamed Circle"}</h3>
                    {description && <p className="text-lg text-gray-400 mt-1 line-clamp-2">{description}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] px-2 py-1 rounded-md bg-white/10 text-white uppercase font-bold tracking-wider">
                      {category}
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-gray-400 uppercase font-bold tracking-wider">
                      {joinType === "open" ? "Open" : "Approval"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-white/10 bg-[#1E1E1E]">
          <button
            onClick={step === 0 ? () => router.push("/Circle") : back}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-white/5 transition-colors text-sm font-medium text-gray-400 hover:text-white cursor-pointer"
          >
            <IoChevronBack size={14} /> {step === 0 ? "Cancel" : "Back"}
          </button>

          {step < 3 ? (
            <button
              onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-lg hover:opacity-80 transition-opacity cursor-pointer"
            >
              Continue <IoChevronForward size={14} />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {creating ? (
                <>
                  <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <IoCheckmarkCircle size={16} /> Launch Circle
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
