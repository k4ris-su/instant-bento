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
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
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
                  className="max-w-xs max-h-48 mx-auto rounded-lg shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-400">
                    Drop your image here, or{" "}
                    <label className="text-blue-500 hover:text-blue-600 cursor-pointer">
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
                  <p className="text-sm text-gray-500 dark:text-gray-500">
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
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Example: I'm a software developer with 5 years experience in React and Node.js. I love building user-friendly applications and have worked at tech startups..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          ✨ Magic Generate
        </button>
      </form>
    </div>
  );
}