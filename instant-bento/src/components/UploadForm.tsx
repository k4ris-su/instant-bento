"use client";

import { useState } from "react";
import { Toaster, toast } from "sonner";

interface UploadFormProps {
  onSubmit: (data: { image: File; text: string }) => void;
}

export function UploadForm({ onSubmit }: UploadFormProps) {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      toast.success("Image uploaded successfully!");
    } else {
      toast.error("Please upload a valid image file");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image) {
      toast.error("Please upload an image");
      return;
    }
    
    if (!text.trim()) {
      toast.error("Please provide some information about yourself");
      return;
    }

    onSubmit({ image, text });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Toaster position="top-center" />
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload Your Photo (Selfie or any photo)
          </label>
          
          <div
            className={`border border-[var(--border)] rounded-xl p-8 text-center transition-all duration-200 bg-[var(--card)] ${
              isDragging ? "ring-accent" : "hover:shadow-soft"
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
          >
            {image ? (
              <div className="space-y-4">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="max-w-xs max-h-48 mx-auto rounded-lg shadow-soft"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="text-[var(--muted)] hover:opacity-80 text-sm"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-[var(--background)] rounded-full flex items-center justify-center border border-[var(--border)]">
                  <svg className="w-6 h-6 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-[var(--muted)]">
                    Drop your image here, or{" "}
                    <label className="text-[var(--accent)] hover:opacity-80 cursor-pointer">
                      browse
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    Supports JPG, PNG, GIF up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-4">
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tell us about yourself (paste your CV, write a few lines, or just add keywords)
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted)]"
            placeholder="Example: I'm a software developer with 5 years experience in React and Node.js. I love building user-friendly applications and have worked at tech startups..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[var(--foreground)] text-[var(--background)] font-medium py-4 px-8 rounded-xl hover:opacity-90 transition"
        >
          Magic Generate
        </button>
      </form>
    </div>
  );
}
