import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Validate API Key
if (!process.env.GEMINI_API_KEY) {
  console.error("⚠️ GEMINI_API_KEY is not set in environment variables!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    // Check API Key first
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Please add it to .env.local file." },
        { status: 500 }
      );
    }

    const data = await request.json();
    const { image, text } = data;
    
    if (!image || !text) {
      return NextResponse.json(
        { error: "Missing image or text" },
        { status: 400 }
      );
    }

    // Extract base64 image data
    const imageParts = image.split(',');
    const imageBase64 = imageParts[1] || image;
    const imageMimeType = imageParts[0]?.includes('data:') ? 
      imageParts[0].split(':')[1].split(';')[0] : 'image/jpeg';

    // ✅ CORRECT: Use proper Gemini models according to API docs
    // - gemini-2.5-flash: For text generation
    // - gemini-2.5-flash-image: For image generation
    const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const imageModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-image",
    });

    // Prompt for text generation (portfolio data)
    const textPrompt = `You are a senior copywriter. Create a professional portfolio based on this information: "${text}".

Please provide a JSON response with this exact structure:
{
  "name": "Full Name",
  "title": "Professional Title",
  "bio": "A compelling 2-3 sentence bio that highlights key skills and personality",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "socials": [
    {"platform": "LinkedIn", "url": "https://linkedin.com/in/username"},
    {"platform": "GitHub", "url": "https://github.com/username"},
    {"platform": "Twitter", "url": "https://twitter.com/username"}
  ],
  "colorTheme": "#hexcolor"
}

Choose a color theme that matches the personality described in the text. Make the bio witty and engaging. Keep skills relevant and concise.`;

    // ✅ CORRECT: Image EDITING prompt according to Gemini docs
    // Gemini can EDIT images using Image + Text-to-Image approach
    // This is semantic masking/inpainting - it modifies the image based on text instructions
    const imagePrompt = `Using the provided portrait photo, enhance it into a professional headshot with these changes:
- Transform the background to a clean, minimalist studio background with soft gradient
- Adjust lighting to soft, professional studio quality with natural highlights
- Keep the person's facial features, expression, and identity EXACTLY the same
- Enhance the overall professional appearance suitable for a portfolio
- Maintain sharp focus on the face
- Create a warm, approachable atmosphere
- Preserve the original pose and framing

Only modify the background and lighting - do not change the person's appearance, clothing, or pose.`;

    console.log("🚀 Generating portfolio with Gemini API...");

    // Run both AI processes in parallel
    const [textResult, imageResult] = await Promise.all([
      textModel.generateContent(textPrompt),
      imageModel.generateContent([
        imagePrompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: imageMimeType,
          },
        },
      ]),
    ]);

    // Parse text response
    const textResponse = await textResult.response.text();
    console.log("📄 Raw AI Response:", textResponse);
    let portfolioData;
    
    try {
      // Extract JSON from the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        portfolioData = JSON.parse(jsonMatch[0]);
        console.log("✅ Successfully parsed portfolio data");
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("⚠️ Failed to parse JSON response:", textResponse);
      // Fallback data
      portfolioData = {
        name: "Professional",
        title: "Creative Developer",
        bio: "Passionate about creating beautiful and functional digital experiences.",
        skills: ["JavaScript", "React", "Node.js", "Design", "Problem Solving"],
        socials: [
          { platform: "LinkedIn", url: "https://linkedin.com" },
          { platform: "GitHub", url: "https://github.com" },
        ],
        colorTheme: "#3B82F6",
      };
    }

    // ✅ CORRECT: Extract generated image from Gemini response
    let processedImage = `data:${imageMimeType};base64,${imageBase64}`; // Default to original
    
    try {
      const imageResponse = imageResult.response;
      if (imageResponse.candidates && imageResponse.candidates.length > 0) {
        const candidate = imageResponse.candidates[0];
        
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            // Check if this part contains inline image data
            if (part.inlineData && part.inlineData.data) {
              const generatedImageBase64 = part.inlineData.data;
              const generatedMimeType = part.inlineData.mimeType || 'image/png';
              processedImage = `data:${generatedMimeType};base64,${generatedImageBase64}`;
              console.log("✅ Successfully generated new image with Gemini");
              break;
            }
          }
        }
      } else {
        console.log("⚠️ No image generated, using original image");
      }
    } catch (imageError) {
      console.error("⚠️ Error processing generated image:", imageError);
      console.log("📌 Using original image as fallback");
    }

    return NextResponse.json({
      ...portfolioData,
      processedImage,
    });

  } catch (error: any) {
    console.error("❌ Error generating portfolio:", error);
    
    // Better error messages
    let errorMessage = "Failed to generate portfolio";
    if (error?.message?.includes("API key")) {
      errorMessage = "Invalid API key. Please check your GEMINI_API_KEY in .env.local";
    } else if (error?.message?.includes("quota")) {
      errorMessage = "API quota exceeded. Please check your Gemini API usage.";
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}