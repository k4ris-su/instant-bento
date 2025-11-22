"use client";

import { useState } from "react";
import { BentoCard } from "@/components/BentoCard";
import { UploadForm } from "@/components/UploadForm";
import { BentoGrid } from "@/components/BentoGrid";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any>(null);

  const handleGenerate = async (formData: { image: File; text: string }) => {
    console.log("🚀 Starting portfolio generation...");
    setIsLoading(true);
    
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(formData.image);
      
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        console.log("📸 Image converted to base64, length:", base64Image.length);
        
        try {
          console.log("🔄 Calling API with text:", formData.text);
          const response = await fetch("/api/generate-portfolio", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: base64Image,
              text: formData.text,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("📊 Received portfolio data:", data);
          setPortfolioData(data);
          setIsLoading(false);
          console.log("✅ Portfolio generation complete!");
        } catch (error) {
          console.error("❌ Error generating portfolio:", error);
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        console.error("❌ Error reading image file");
        setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Instant Bento
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            From Chaos to Portfolio in 5 Seconds
          </p>
        </div>

        {!portfolioData && !isLoading && (
          <UploadForm onSubmit={handleGenerate} />
        )}

        {isLoading && <LoadingSkeleton />}

        {portfolioData && !isLoading && (
          <div className="space-y-6">
            <div className="text-center">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                🔄 Create Another Portfolio
              </button>
            </div>
            <BentoGrid data={portfolioData} />
          </div>
        )}
      </div>
    </div>
  );
}
