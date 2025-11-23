"use client";

import { useState, useRef } from "react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface UploadFormProps {
  onSubmit: (data: { image: File; text: string }) => void;
}

export function UploadForm({ onSubmit }: UploadFormProps) {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="max-w-2xl mx-auto relative z-20">
      <Toaster position="top-center" theme="dark" />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload Area */}
        <div className="group relative">
          <div
            className={`
              relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ease-out
              ${isDragging ? "border-[#32f08c] bg-[#32f08c]/5 scale-[1.02]" : "border-white/20 hover:border-white/40 bg-black/20"}
              ${image ? "border-solid border-[#32f08c]/50" : ""}
            `}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
          >
            {/* Pixel Corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#32f08c] -translate-x-[1px] -translate-y-[1px]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#32f08c] translate-x-[1px] -translate-y-[1px]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#32f08c] -translate-x-[1px] translate-y-[1px]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#32f08c] translate-x-[1px] translate-y-[1px]" />

            <div className="p-12 flex flex-col items-center justify-center min-h-[300px] text-center">
              <AnimatePresence mode="wait">
                {image ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative w-full max-w-sm"
                  >
                    <div className="relative rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        className="w-full h-auto object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImage(null);
                          }}
                          className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider rounded backdrop-blur-sm transition-colors"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                    <p className="mt-4 text-xs font-mono text-[#32f08c]">
                      <span className="mr-2">✓</span>
                      IMAGE_LOADED_SUCCESSFULLY
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-zinc-400 group-hover:text-[#32f08c] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-zinc-200">Upload your photo</h3>
                      <p className="text-sm text-zinc-500 font-mono max-w-xs mx-auto">
                        Drag & drop or <span className="text-[#32f08c] cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>browse</span> to upload.
                        <br/>
                        Supports JPG, PNG, WEBP.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                }}
              />
            </div>
          </div>
        </div>

        {/* Text Input Area */}
        <div className="space-y-2">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#32f08c]/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell us about yourself... (e.g., 'I'm a software engineer based in Tokyo who loves minimal design and coffee.')"
              className="relative w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-[#32f08c]/50 focus:ring-1 focus:ring-[#32f08c]/50 transition-all resize-none font-mono text-sm"
            />
            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              {text.length} chars
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full group relative px-8 py-4 bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-[#32f08c] transition-colors duration-300 overflow-hidden rounded-xl"
        >
          <div className="absolute inset-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <span className="relative flex items-center justify-center gap-2">
            Generate Portfolio
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </button>
      </form>
    </div>
  );
}
