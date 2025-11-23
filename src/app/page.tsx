"use client";

import { useState } from "react";
import { UploadForm } from "@/components/UploadForm";
import { BentoGrid } from "@/components/BentoGrid";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { H1, Muted } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import Iridescence from "@/components/Iridescence";
import DecryptedText from "@/components/DecryptedText";
import Hyperspeed from "@/components/Hyperspeed";
import SplitText from "@/components/SplitText";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
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

  const [streamLog, setStreamLog] = useState<string>("");

  const handleGenerate = async (formData: { image: File; text: string }) => {
    console.log("🚀 Starting portfolio generation...");
    setIsLoading(true);
    setStreamLog("");

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(formData.image);

      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        try {
          const response = await fetch("/api/generate-portfolio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Image, text: formData.text }),
          });

          if (!response.ok) throw new Error(`API Error: ${response.status}`);
          if (!response.body) throw new Error("No response body");

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulatedText = "";
          let finalImage = "";
          let buffer = "";

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
                  accumulatedText += data.content;
                  setStreamLog(prev => prev + data.content);
                } else if (data.type === 'image') {
                  finalImage = data.content;
                }
              } catch (e) {
                console.warn("Error parsing stream chunk", e);
                // If JSON parse fails, it might be part of a split line that got processed too early
                // but with our logic, 'line' should be a complete line.
                // However, if the backend sends partial JSON over newlines (it shouldn't based on our backend logic), this could still fail.
                // Our backend logic sends `JSON.stringify(...) + "\n"`, so valid JSON objects should always be on one line.
              }
            }
          }

          // Process any remaining buffer content if it forms a valid JSON
          if (buffer.trim()) {
             try {
                const data = JSON.parse(buffer);
                if (data.type === 'chunk') {
                  accumulatedText += data.content;
                  setStreamLog(prev => prev + data.content);
                } else if (data.type === 'image') {
                  finalImage = data.content;
                }
             } catch { /* ignore incomplete end */ }
          }

          // Parse the final JSON from the accumulated text
          // We look for the JSON block after the "THOUGHTS" section
          // Improved regex to find the last JSON object in the text
          let finalData;
          try {
            // Try to find the last valid JSON object
            const jsonRegex = /\{[\s\S]*\}/g;
            const matches = accumulatedText.match(jsonRegex);

            if (matches) {
              // Iterate backwards to find the first valid JSON
              for (let i = matches.length - 1; i >= 0; i--) {
                try {
                  // Check if it looks like our expected structure
                  const potentialJson = JSON.parse(matches[i]);
                  if (potentialJson.name && potentialJson.customNodes) {
                    finalData = potentialJson;
                    break;
                  }
                } catch {
                  continue;
                }
              }

              // If simple match didn't work, try to extract from "JSON:" marker if present
              if (!finalData) {
                 const jsonMarkerMatch = accumulatedText.match(/JSON:\s*(\{[\s\S]*\})/);
                 if (jsonMarkerMatch) {
                    try {
                       finalData = JSON.parse(jsonMarkerMatch[1]);
                    } catch {}
                 }
              }
            }
          } catch (e) {
            console.error("Failed to parse final JSON", e);
          }

          if (finalData) {
            setPortfolioData({
              ...finalData,
              processedImage: finalImage || base64Image
            });
          }

          setIsLoading(false);
        } catch (error) {
          console.error("❌ Error generating portfolio:", error);
          setIsLoading(false);
        }
      };

    } catch (error) {
      console.error("❌ Error generating portfolio:", error);
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <Iridescence color={[0.3, 0.3, 0.3]} mouseReact={false} amplitude={0.1} speed={0.5} />
      </div>

      <div className="container-modern py-12 relative z-10">
        <header className="mb-10 text-center md:text-left">
          <div className="text-4xl md:text-6xl font-bold tracking-tighter mb-2">
            <DecryptedText
              text="Instant Bento"
              animateOn="view"
              revealDirection="center"
              className="text-[var(--foreground)]"
            />
          </div>
          <div className="text-[var(--muted)] text-lg">
            <SplitText
              text="From Chaos to Portfolio in 5 Seconds"
              className="inline-block"
              delay={50}
            />
          </div>
        </header>

        {!portfolioData && !isLoading && (
          <UploadForm onSubmit={handleGenerate} />
        )}

        {isLoading && (
           <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
             <div className="absolute inset-0 opacity-50">
                <Hyperspeed />
             </div>

             <div className="relative z-10 max-w-2xl w-full p-8 space-y-6 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10">
               <div className="text-center space-y-2">
                 <h2 className="text-3xl font-bold text-white animate-pulse">Generating Portfolio...</h2>
                 <p className="text-zinc-400">Analyzing your profile and designing your bento grid.</p>
               </div>

               {/* Thinking Process Log */}
               <div className="bg-black/50 rounded-xl p-6 font-mono text-sm overflow-hidden border border-white/5 h-64">
                 <div className="flex items-center gap-2 mb-2 text-green-400">
                   <span className="animate-pulse">●</span>
                   <span className="font-bold">AI Agent Thinking...</span>
                 </div>
                 <div className="h-full overflow-y-auto text-zinc-500 whitespace-pre-wrap scrollbar-hide text-xs pb-8">
                   {streamLog || "Initializing agent..."}
                 </div>
               </div>
             </div>
           </div>
        )}

        {portfolioData && !isLoading && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <H1 className="text-2xl">Your Portfolio</H1>
              <div className="flex gap-2">
                <Button onClick={handleDownload} variant="outline">Download HTML</Button>
                <Button onClick={handleReset} variant="secondary">Create Another</Button>
              </div>
            </div>
            <BentoGrid data={portfolioData} />
          </div>
        )}
      </div>
    </div>
  );
}
