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

    // Use the user-requested model
    // "hãy sử dụng model models/gemini-3-pro-preview"
    // We will use a single model for the "Agent" workflow to maintain context
    const model = genAI.getGenerativeModel({ 
      model: "models/gemini-3-pro-preview",
      generationConfig: {
        temperature: 1.0, // Recommended for Gemini 3
      }
    });

    // We will also keep the image model for the specific image generation task
    // using the model from the docs provided
    const imageModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-image", 
    });

    console.log("🚀 Starting Agentic Workflow...");

    // Step 1: Image Enhancement (Parallel)
    // We start this immediately as it takes time
    const imagePromise = imageModel.generateContent([
      `Using the provided portrait photo, enhance it into a professional headshot with these changes:
      - Transform the background to a clean, minimalist studio background with soft gradient
      - Adjust lighting to soft, professional studio quality with natural highlights
      - Keep the person's facial features, expression, and identity EXACTLY the same
      - Enhance the overall professional appearance suitable for a portfolio
      - Maintain sharp focus on the face
      - Create a warm, approachable atmosphere
      - Preserve the original pose and framing
      
      Only modify the background and lighting - do not change the person's appearance, clothing, or pose.`,
      {
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType,
        },
      },
    ]);

    // Step 2: Agent Thinking & Content Generation
    // We create a stream to send "thoughts" and then the final JSON
    const textPrompt = `
    Role: You are an elite Design Agent & Content Strategist.
    Task: Create a world-class personal portfolio based on the user's raw input: "${text}".
    
    Process:
    1. ANALYZE: Deeply analyze the input text to understand the user's persona, key strengths, and potential role.
    2. STRATEGIZE: Plan the portfolio structure. Decide on a unique angle (e.g., "The Innovative Problem Solver" or "The Minimalist Creator").
    3. GENERATE: Write compelling, high-converting copy.
       - Name: Extrapolate or use the provided name.
       - Title: Create a powerful, modern job title.
       - Bio: Write a punchy, memorable bio (not generic).
       - Skills: Curate a list of high-impact skills.
       - Socials: format provided links or placeholders.
       - Color Theme: Pick a sophisticated hex code matching the persona.
       - Bento Layout Strategy: Decide how to arrange the grid (implied by the content weight).
    
    Output Format:
    First, output your "THOUGHTS" block where you explain your reasoning step-by-step.
    Then, output the final "JSON" block.
    
    Example structure:
    THOUGHTS:
    - User mentioned "design" and "code", suggesting a Design Engineer persona.
    - I will focus on a clean, swiss-style aesthetic.
    - Bio should be punchy.
    ...
    JSON:
    {
      "name": "...",
      "title": "...",
      "bio": "...",
      "skills": [...],
      "socials": [...],
      "colorTheme": "#...",
      "stats": [
         {"label": "Years Exp", "value": "5+"},
         {"label": "Projects", "value": "20+"}
      ]
    }
    `;

    const result = await model.generateContentStream(textPrompt);

    // Create a readable stream for the client
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Stream text generation (Thoughts + Partial JSON)
          let fullText = "";
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            // Send chunk to client
            controller.enqueue(encoder.encode(JSON.stringify({ type: 'chunk', content: chunkText }) + "\n"));
          }

          // Wait for image generation
          let processedImage = `data:${imageMimeType};base64,${imageBase64}`;
          try {
            const imageResult = await imagePromise;
            const candidate = imageResult.response.candidates?.[0];
            if (candidate?.content?.parts?.[0]?.inlineData) {
               const imgPart = candidate.content.parts[0].inlineData;
               processedImage = `data:${imgPart.mimeType || 'image/png'};base64,${imgPart.data}`;
            }
          } catch (e) {
            console.error("Image generation failed", e);
          }

          // Send final image event
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'image', content: processedImage }) + "\n"));

          // Close stream
          controller.close();
        } catch (error) {
          console.error("Streaming error", error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Transfer-Encoding': 'chunked',
      },
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
