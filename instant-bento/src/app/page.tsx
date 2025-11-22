"use client";

import { useState } from "react";
import { BentoCard } from "@/components/BentoCard";
import { UploadForm } from "@/components/UploadForm";
import { BentoGrid } from "@/components/BentoGrid";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { H1, Muted } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any>(null);

  const [streamLog, setStreamLog] = useState<string>("");
  const [isThinking, setIsThinking] = useState(false);

  const handleGenerate = async (formData: { image: File; text: string }) => {
    console.log("🚀 Starting portfolio generation...");
    setIsLoading(true);
    setIsThinking(true);
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

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

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
              }
            }
          }

          // Parse the final JSON from the accumulated text
          // We look for the JSON block after the "THOUGHTS" section
          const jsonMatch = accumulatedText.match(/JSON:\s*(\{[\s\S]*\})/);
          let finalData;

          if (jsonMatch) {
            try {
              finalData = JSON.parse(jsonMatch[1]);
            } catch (e) {
              console.error("Failed to parse final JSON", e);
            }
          } else {
             // Fallback: try to find any JSON object
             const fallbackMatch = accumulatedText.match(/\{[\s\S]*\}/);
             if (fallbackMatch) {
                try {
                  finalData = JSON.parse(fallbackMatch[0]);
                } catch(e) { console.error("Fallback parse failed", e); }
             }
          }

          if (finalData) {
            setPortfolioData({
              ...finalData,
              processedImage: finalImage || base64Image
            });
          }

          setIsLoading(false);
          setIsThinking(false);
        } catch (error) {
          console.error("❌ Error generating portfolio:", error);
          setIsLoading(false);
          setIsThinking(false);
        }
      };
      
    } catch (error) {
      console.error("❌ Error generating portfolio:", error);
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  const handleReset = () => {
    console.log("🔄 Resetting portfolio");
    setPortfolioData(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container-modern py-12">
        <header className="mb-10">
          <H1>Instant Bento</H1>
          <Muted>
            From Chaos to Portfolio in 5 Seconds
          </Muted>
        </header>

        {!portfolioData && !isLoading && (
          <UploadForm onSubmit={handleGenerate} />
        )}

        {isLoading && (
           <div className="max-w-2xl mx-auto space-y-6">
             <LoadingSkeleton />
             
             {/* Thinking Process Log */}
             <div className="bg-black/5 dark:bg-white/5 rounded-xl p-6 font-mono text-sm overflow-hidden">
               <div className="flex items-center gap-2 mb-2 text-[var(--accent)]">
                 <span className="animate-pulse">●</span>
                 <span className="font-bold">AI Agent Thinking...</span>
               </div>
               <div className="h-48 overflow-y-auto text-[var(--muted)] whitespace-pre-wrap scrollbar-hide text-xs">
                 {streamLog || "Initializing agent..."}
               </div>
             </div>
           </div>
        )}

        {portfolioData && !isLoading && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <H1 className="text-2xl">Your Portfolio</H1>
              <Button onClick={handleReset} variant="secondary">Create Another</Button>
            </div>
            <BentoGrid data={portfolioData} />
          </div>
        )}
      </div>
    </div>
  );
}
