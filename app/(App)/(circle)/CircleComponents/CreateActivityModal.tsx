"use client";

import React, { useState } from "react";
import { MdCancel } from "react-icons/md";
import { toast } from "react-toastify";
import { useTopLoader } from "nextjs-toploader";
import { IoCloudUpload, IoClose } from "react-icons/io5";
import { FaExchangeAlt, FaPalette } from "react-icons/fa";

interface CreateActivityModalProps {
  circleId: string;
  onClose: () => void;
  onCreated?: () => void;
}

type ActivityType = "art_jam" | "prompt_battle";

export default function CreateActivityModal({
  circleId,
  onClose,
  onCreated,
}: CreateActivityModalProps) {
  const [activityType, setActivityType] = useState<ActivityType>("art_jam");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [promptA, setPromptA] = useState("");
  const [promptB, setPromptB] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const loader = useTopLoader();

  const inputCls =
    "w-full rounded-xl border-2 border-dotted border-(--border) dark:border-(--borderdark) bg-(--colorbg) dark:bg-(--colorbgdark) px-4 py-2 text-base outline-none focus:border-solid transition-all";

  const handleCreate = async () => {
    if (!title.trim()) return toast.error("Please enter a title");
    if (!startDate) return toast.error("Please set a start date");
    if (!endDate) return toast.error("Please set an end date");
    if (new Date(endDate) <= new Date(startDate))
      return toast.error("End date must be after start date");

    if (activityType === "art_jam" && !prompt.trim())
      return toast.error("Please enter the jam prompt");
    if (activityType === "prompt_battle") {
      if (!promptA.trim()) return toast.error("Please enter Prompt A");
      if (!promptB.trim()) return toast.error("Please enter Prompt B");
    }

    try {
      loader.start();
      setCreating(true);

      let uploadedCoverUrl = null;
      if (coverFile) {
        const formData = new FormData();
        formData.append("file", coverFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) throw new Error("Cover image upload failed");
        uploadedCoverUrl = uploadData.url;
      }

      const body: Record<string, unknown> = {
        activityType,
        title: title.trim(),
        description: description.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      };

      if (maxParticipants && Number(maxParticipants) > 0) {
        body.maxParticipants = Number(maxParticipants);
      }

      if (uploadedCoverUrl) {
        body.coverImage = uploadedCoverUrl;
      }

      if (activityType === "art_jam") {
        body.prompt = prompt.trim();
      } else {
        body.promptA = promptA.trim();
        body.promptB = promptB.trim();
      }

      const res = await fetch(
        `/api/circles/${circleId}/activities/shared-prompt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Activity created!");
      onCreated?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create activity");
    } finally {
      setCreating(false);
      loader.done();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-8 overflow-y-auto">
      <div className="relative bg-(--color-background) dark:bg-(--background) border border-(--border) dark:border-(--borderdark) rounded-lg shadow-lg w-full max-w-md my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer hover:opacity-70 transition-opacity z-10"
        >
          <MdCancel size={22} />
        </button>

        <div className="p-6 space-y-5">
          {/* Header */}
          <h2 className="text-2xl pr-8">Create Activity</h2>

          {/* Type selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setActivityType("art_jam")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dotted cursor-pointer transition-all text-base ${activityType === "art_jam"
                  ? "border-(--border) dark:border-(--borderdark) bg-(--colorbg) dark:bg-(--colorbgdark)"
                  : "border-transparent hover:border-(--border) dark:hover:border-(--borderdark)"
                }`}
            >
              <FaPalette size={15} />
              Art Jam
            </button>
            <button
              onClick={() => setActivityType("prompt_battle")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dotted cursor-pointer transition-all text-base ${activityType === "prompt_battle"
                  ? "border-(--border) dark:border-(--borderdark) bg-(--colorbg) dark:bg-(--colorbgdark)"
                  : "border-transparent hover:border-(--border) dark:hover:border-(--borderdark)"
                }`}
            >
              <FaExchangeAlt size={15} />
              Prompt Battle
            </button>
          </div>

          <hr className="border-t border-(--border) dark:border-(--borderdark)" />

          {/* Cover Image Upload */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-500 dark:text-neutral-400">
              Cover Image <span className="opacity-50">(optional)</span>
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              id="cover-upload"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setCoverFile(f);
                  setCoverPreview(URL.createObjectURL(f));
                }
              }}
            />
            {!coverPreview ? (
              <label
                htmlFor="cover-upload"
                className="cursor-pointer w-full gap-y-2 items-center justify-center flex flex-col h-32 rounded-xl border-2 border-dotted border-(--border) dark:border-(--borderdark) bg-(--colorbg) dark:bg-(--colorbgdark) hover:opacity-80 transition-opacity"
              >
                <IoCloudUpload size={24} className="text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-neutral-400">
                  Upload cover art
                </p>
              </label>
            ) : (
              <div className="relative w-full h-32 rounded-xl border border-(--border) dark:border-(--borderdark) overflow-hidden">
                <button
                  onClick={() => {
                    setCoverFile(null);
                    setCoverPreview(null);
                  }}
                  className="absolute top-2 right-2 z-10 flex items-center justify-center rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 cursor-pointer"
                >
                  <IoClose size={16} />
                </button>
                <img
                  src={coverPreview}
                  alt="cover preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-500 dark:text-neutral-400">
              Title
            </label>
            <input
              placeholder={
                activityType === "art_jam"
                  ? "e.g. March Art Jam"
                  : "e.g. Decay vs Growth"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Art Jam prompt */}
          {activityType === "art_jam" && (
            <div className="space-y-1.5">
              <label className="text-sm text-gray-500 dark:text-neutral-400">
                Prompt
              </label>
              <input
                placeholder="e.g. Something That's Changing"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={inputCls}
              />
            </div>
          )}

          {/* Prompt Battle prompts */}
          {activityType === "prompt_battle" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm text-gray-500 dark:text-neutral-400">
                  Prompt A
                </label>
                <input
                  placeholder="e.g. Decay"
                  value={promptA}
                  onChange={(e) => setPromptA(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-500 dark:text-neutral-400">
                  Prompt B
                </label>
                <input
                  placeholder="e.g. Growth"
                  value={promptB}
                  onChange={(e) => setPromptB(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-500 dark:text-neutral-400">
              Description{" "}
              <span className="opacity-50">(optional)</span>
            </label>
            <textarea
              placeholder="A short description for participants…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-gray-500 dark:text-neutral-400">
                Start
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-gray-500 dark:text-neutral-400">
                End
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Max participants */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-500 dark:text-neutral-400">
              Max participants{" "}
              <span className="opacity-50">(optional)</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder="No limit"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-(--border) dark:border-(--borderdark) cursor-pointer transition-colors hover:bg-(--colorbg) dark:hover:bg-(--colorbgdark) text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 rounded-full border border-(--border) dark:border-(--borderdark) bg-(--colorbg) dark:bg-(--colorbgdark) cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating…" : "Create Activity"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
