import React, { useState, useRef } from "react";
import { IoClose, IoImageOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { useTopLoader } from "nextjs-toploader";

export default function CreateCollectionModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (collection: any) => void;
}) {
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loader = useTopLoader();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  const handleCreateCollection = async () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a title for your collection.", { position: "top-right" });
      return;
    }
    try {
      loader.start();
      setCreating(true);

      let coverImageUrl = "";
      if (coverImageFile) {
        const formData = new FormData();
        formData.append("file", coverImageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          coverImageUrl = uploadData.url;
        } else {
          toast.error("Failed to upload cover image.", { position: "top-right" });
          loader.done();
          setCreating(false);
          return;
        }
      }

      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: newTitle.trim(), 
          description: newDesc.trim(),
          coverImage: coverImageUrl || undefined
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to create collection.", { position: "top-right" });
        loader.done();
        setCreating(false);
        return;
      }
      
      toast.success("Collection created!", { position: "top-right" });
      onSuccess(data.collection);
      loader.done();
      setCreating(false);
    } catch {
      toast.error("Something went wrong.", { position: "top-right" });
      loader.done();
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-(--foreground) text-left">
      <div className="bg-(--colorbg) border border-(--border) rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 hover:cursor-pointer right-4 text-(--text-muted) hover:text-(--foreground) transition-colors"
        >
          <IoClose size={22} />
        </button>

        <h2 className="text-2xl font-bold">Create Collection</h2>

        <div className="space-y-4">
          {/* Cover Image Picker */}
          <div>
            <label className="block text-sm font-medium mb-2 text-(--text-muted) dark:text-(--text-muted-dark)">
              Cover Image
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 rounded-xl border-2 border-dashed border-(--border) bg-(--colorbg) flex flex-col items-center justify-center cursor-pointer hover:bg-(--hover) transition-colors overflow-hidden relative"
            >
              {coverImagePreview ? (
                <img src={coverImagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-(--text-muted)">
                  <IoImageOutline size={32} className="mb-2" />
                  <span className="text-sm">Click to upload cover image</span>
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
          
          <div>
            <label className="block text-sm font-medium mb-1 text-(--text-muted) dark:text-(--text-muted-dark)">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Autumn Studies"
              className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--colorbg) outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-(--foreground)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-(--text-muted) dark:text-(--text-muted-dark)">
              Description
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="What is this collection about?"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--colorbg) outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none text-(--foreground)"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-(--border) hover:bg-(--hover) transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateCollection}
            disabled={creating}
            className="px-6 py-2 rounded-xl bg-[#3B5D95] hover:bg-[#2e4a7a] text-white font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
