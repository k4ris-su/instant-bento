"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { UploadForm } from "@/components/UploadForm";
import { BentoGrid } from "@/components/BentoGrid";
import { H1 } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import DecryptedText from "@/components/DecryptedText";
import SplitText from "@/components/SplitText";
import { BackgroundLayer, BACKGROUNDS } from "@/components/BackgroundLayer";
import StreamLogViewer from "@/components/StreamLogViewer";
import imageCompression from 'browser-image-compression';
import { ShareDialog } from "@/components/ShareDialog";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [backgroundComponent, setBackgroundComponent] = useState<any>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    // Set the default background (Dark Veil)
    setBackgroundComponent(BACKGROUNDS[0]);
  }, []);

  type PortfolioData = {
    name: string;
    title: string;
    bio: string;
    skills: string[];
    socials: { platform: string; url: string }[];
    colorTheme: string;
    processedImage: string;
    stats?: { label: string; value: string }[];
    customNodes?: { colSpan: number; rowSpan: number; type: "html" | "text" | "stat"; content: string }[];
  } | null;

  const [portfolioData, setPortfolioData] = useState<PortfolioData>(null);
  const [lastInput, setLastInput] = useState<{ image: File; text: string } | null>(null);

  const [streamLog, setStreamLog] = useState<string>("");

  const handleGenerate = async (formData: { image: File; text: string }) => {
    console.log("🚀 Starting portfolio generation...");
    setLastInput(formData);
    setIsLoading(true);
    setStreamLog("");

    try {
      // Compress image before sending
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };

      let imageFile = formData.image;
      try {
        imageFile = await imageCompression(formData.image, options);
      } catch (error) {
        console.warn("Image compression failed, using original", error);
      }

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);

      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            if (retryCount > 0) {
               setStreamLog(prev => prev + `\n\n🔄 Retry attempt ${retryCount}/${maxRetries}...\n`);
               await new Promise(r => setTimeout(r, 2000));
            }

            const response = await fetch("/api/generate-portfolio", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: base64Image, text: formData.text }),
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let finalImage = "";
            let buffer = "";
            let hasReceivedData = false;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              // Append new chunk to buffer
              buffer += decoder.decode(value, { stream: true });

              // Process complete lines
              const lines = buffer.split("\n");

              // Keep the last potentially incomplete line in the buffer
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (!line.trim()) continue;
                try {
                  const data = JSON.parse(line);
                  if (data.type === 'chunk') {
                    setStreamLog(prev => prev + data.content);
                  } else if (data.type === 'data') {
                    hasReceivedData = true;
                    setPortfolioData({
                      ...data.content,
                      processedImage: finalImage || base64Image
                    });
                  } else if (data.type === 'image') {
                    finalImage = data.content;
                  }
                } catch (e) {
                  console.warn("Error parsing stream chunk", e);
                }
              }
            }

            // Process any remaining buffer
            if (buffer.trim()) {
              try {
                const data = JSON.parse(buffer);
                if (data.type === 'chunk') {
                  setStreamLog(prev => prev + data.content);
                } else if (data.type === 'data') {
                  hasReceivedData = true;
                  setPortfolioData({
                    ...data.content,
                    processedImage: finalImage || base64Image
                  });
                }
              } catch (e) {
                console.warn("Error parsing final buffer", e);
              }
            }

            // If we finished the stream but didn't get data, treat as error to trigger retry
            if (!hasReceivedData && !portfolioData) {
                throw new Error("Stream finished but no portfolio data received");
            }

            // Success!
            setIsLoading(false);
            break;

          } catch (error) {
            console.error(`Generation attempt ${retryCount + 1} failed:`, error);
            retryCount++;

            if (retryCount >= maxRetries) {
              setStreamLog(prev => prev + "\n\n❌ Error: " + (error as Error).message);
              toast.error("Generation failed after multiple attempts. See logs.");
              setIsLoading(false);
            }
          }
        }
      };

    } catch (error) {
      console.error("Error reading image:", error);
      setIsLoading(false);
    }
  };

  const handleRecreate = () => {
    if (lastInput) {
      handleGenerate(lastInput);
    }
  };

  const handleReset = () => {
    console.log("🔄 Resetting portfolio");
    setPortfolioData(null);
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!portfolioData) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${portfolioData.name} - Portfolio</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { background-color: #09090b; color: #e4e4e7; font-family: sans-serif; }
        </style>
      </head>
      <body class="p-8">
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <!-- Hero -->
          <div class="col-span-1 md:col-span-4 lg:col-span-4 row-span-2 relative rounded-3xl overflow-hidden h-[400px]">
            <img src="${portfolioData.processedImage}" class="absolute inset-0 w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
            <div class="relative z-10 h-full flex flex-col justify-end p-8">
              <h1 class="text-6xl font-bold text-white">${portfolioData.name}</h1>
              <p class="text-2xl text-gray-300">${portfolioData.title}</p>
            </div>
          </div>

          <!-- Stats -->
          <div class="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 flex flex-col gap-4">
             <div class="flex-1 bg-zinc-900 rounded-3xl p-6 flex flex-col items-center justify-center border border-zinc-800">
                <span class="text-5xl font-bold text-white">${portfolioData.stats?.[0]?.value}</span>
                <span class="text-sm text-zinc-500 uppercase">${portfolioData.stats?.[0]?.label}</span>
             </div>
             <div class="flex-1 bg-zinc-900 rounded-3xl p-6 flex flex-col items-center justify-center border border-zinc-800">
                <span class="text-5xl font-bold text-[${portfolioData.colorTheme}]">${portfolioData.stats?.[1]?.value}</span>
                <span class="text-sm text-zinc-500 uppercase">${portfolioData.stats?.[1]?.label}</span>
             </div>
          </div>

          <!-- Bio -->
          <div class="col-span-1 md:col-span-2 lg:col-span-3 row-span-1 bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
            <h3 class="text-lg font-semibold mb-3 text-[${portfolioData.colorTheme}]">About</h3>
            <p class="text-zinc-400 leading-relaxed">${portfolioData.bio}</p>
          </div>

          <!-- Socials -->
          <div class="col-span-1 md:col-span-2 lg:col-span-3 row-span-1 bg-zinc-900 rounded-3xl p-6 border border-zinc-800 flex flex-col justify-center">
             <div class="flex flex-wrap gap-3">
               ${portfolioData.socials.map(s => `<a href="${s.url}" class="px-4 py-2 bg-black rounded-xl border border-zinc-800 text-zinc-300 hover:text-white">${s.platform}</a>`).join('')}
             </div>
          </div>

          <!-- Skills -->
          <div class="col-span-1 md:col-span-4 lg:col-span-6 bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
             <div class="flex flex-wrap gap-2">
               ${portfolioData.skills.map(s => `<span class="px-3 py-1 bg-zinc-800 rounded-lg text-sm text-zinc-300">${s}</span>`).join('')}
             </div>
          </div>

          <!-- Custom Nodes -->
          ${portfolioData.customNodes?.map(node => `
            <div class="col-span-1 md:col-span-${Math.min(node.colSpan, 4)} lg:col-span-${Math.min(node.colSpan, 6)} row-span-${node.rowSpan} rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900">
              ${node.type === 'html' ? node.content : `<div class="p-6 text-zinc-400">${node.content}</div>`}
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${portfolioData.name.replace(/\s+/g, '-').toLowerCase()}-portfolio.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!portfolioData) return;

    const toastId = toast.loading("Compressing & Saving...");

    try {
        let finalImage = portfolioData.processedImage;

        // Compress if it's a base64 string
        if (finalImage.startsWith('data:image')) {
            try {
                // Convert Base64 to Blob
                const res = await fetch(finalImage);
                const blob = await res.blob();

                // Compress
                const options = {
                    maxSizeMB: 0.5, // Max 0.5MB
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                };
                const file = new File([blob], "image.png", { type: blob.type });
                const compressedBlob = await imageCompression(file, options);

                // Convert back to Base64
                const reader = new FileReader();
                finalImage = await new Promise<string>((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(compressedBlob);
                });
            } catch (e) {
                console.warn("Compression failed, using original image", e);
            }
        }

        const response = await fetch('/api/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                portfolioData: { ...portfolioData, processedImage: finalImage }
            })
        });

        if (!response.ok) throw new Error('Failed to save');

        const { shortId } = await response.json();
        const url = `${window.location.origin}/p/${shortId}`;

        setShareUrl(url);
        setShareDialogOpen(true);
        toast.success("Portfolio ready to share!", { id: toastId });
    } catch (error) {
        console.error(error);
        toast.error("Failed to share portfolio", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-mono selection:bg-[#32f08c] selection:text-black">
      {/* Background Effect */}
      <BackgroundLayer backgroundComponent={backgroundComponent} />

      {/* Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      <div className="container-modern py-12 relative z-10">
        {!isLoading && (
          <header className="mb-16 text-center md:text-left relative">
            {/* Decorative Pixel Elements */}
            <div className="absolute -top-8 -left-8 w-4 h-4 border-t-2 border-l-2 border-[#32f08c] opacity-50" />
            <div className="absolute -top-8 -right-8 w-4 h-4 border-t-2 border-r-2 border-[#32f08c] opacity-50" />

            <div className="text-4xl md:text-7xl font-bold tracking-tighter mb-4 font-mono text-white">
              <DecryptedText
                text="Instant Bento"
                animateOn="view"
                revealDirection="center"
                className="text-white"
              />
            </div>
            <div className="text-zinc-400 text-lg md:text-xl font-mono flex items-center gap-2 justify-center md:justify-start">
              <span className="text-[#32f08c]">{`>`}</span>
              <SplitText
                text="From Chaos to Portfolio in 5 Seconds"
                className="inline-block"
                delay={50}
              />
              <span className="animate-pulse w-2 h-4 bg-[#32f08c] inline-block ml-1" />
            </div>
          </header>
        )}

        {!portfolioData && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <UploadForm onSubmit={handleGenerate} />
          </div>
        )}

        {isLoading && (
           <div className="min-h-[60vh] flex flex-col items-center justify-center relative z-50">
             <div className="relative z-10 max-w-2xl w-full p-8 space-y-6">
               <div className="text-center space-y-2">
                 <h2 className="text-3xl font-bold text-white animate-pulse font-mono">
                   <span className="text-[#32f08c] mr-2">{`>`}</span>
                   GENERATING_PORTFOLIO
                   <span className="animate-blink">_</span>
                 </h2>
                 <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">Analyzing profile data...</p>
               </div>

               {/* Thinking Process Log */}
               <StreamLogViewer log={streamLog} />
             </div>
           </div>
        )}

        {portfolioData && !isLoading && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-2">
                <span className="text-[#32f08c] text-2xl">●</span>
                <H1 className="text-2xl font-mono uppercase tracking-widest text-white">System_Output: Portfolio_Generated</H1>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleShare} variant="secondary" className="font-mono text-xs uppercase tracking-wider hover:bg-[#32f08c] hover:text-black transition-colors">
                  [ Share ]
                </Button>
                <Button onClick={handleDownload} variant="secondary" className="font-mono text-xs uppercase tracking-wider hover:bg-[#32f08c] hover:text-black transition-colors">
                  [ Download HTML ]
                </Button>
                <Button onClick={handleRecreate} variant="secondary" className="font-mono text-xs uppercase tracking-wider hover:bg-[#32f08c] hover:text-black transition-colors">
                  [ Recreate ]
                </Button>
                <Button onClick={handleReset} variant="secondary" className="font-mono text-xs uppercase tracking-wider hover:bg-[#32f08c] hover:text-black transition-colors">
                  [ New ]
                </Button>
              </div>
            </div>
            <BentoGrid data={portfolioData} />
          </div>
        )}

        {!isLoading && (
          <footer className="mt-24 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-500 font-mono text-xs uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="text-[#32f08c]">●</span>
              <span>System Status: Online</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 text-center">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥉</span>
                <span className="text-zinc-400">3rd Prize Winner</span>
                <span className="hidden md:inline text-zinc-700">|</span>
                <span>TRAE Meetup & Vibe Coding Experience @ Vietnam</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <a
                href="https://github.com/k4ris-su/instant-bento"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity hover:text-[#32f08c]"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>Source</span>
              </a>

              <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <span>Powered by</span>
                <Image
                  src="https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/trae-color.png"
                  alt="Trae Logo"
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain"
                  unoptimized
                />
                <span className="font-bold text-zinc-300">Trae</span>
              </div>
            </div>
          </footer>
        )}
      </div>

      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        url={shareUrl}
      />
    </div>
  );
}
