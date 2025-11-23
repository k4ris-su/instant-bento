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
    // "đổi model sang models/gemini-flash-latest" (Using gemini-1.5-flash as the standard latest flash model)
    // We will use a single model for the "Agent" workflow to maintain context
    const model = genAI.getGenerativeModel({
      model: "models/gemini-flash-latest",
      generationConfig: {
        temperature: 1.0,
      }
    });

    console.log("🚀 Starting Agentic Workflow...");

    // Step 1: Image Enhancement (Skipped)
    // We will just pass through the original image.
    const imagePromise = Promise.resolve({
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: imageMimeType,
                    data: imageBase64
                  }
                }
              ]
            }
          }
        ]
      }
    });

    // Step 2: Agent Thinking & Content Generation
    // We create a stream to send "thoughts" and then the final JSON
    const textPrompt = `
    Role: You are an elite Senior UI/UX Designer & Content Strategist powered by Gemini 3.
    Task: Create a world-class, highly detailed personal portfolio based on the user's raw input: "${text}".

    **LANGUAGE RULE: ENGLISH ONLY**
    - **CRITICAL:** All generated content (Name, Title, Bio, Skills, Custom Nodes) MUST be in **English**.
    - If the input is in another language (e.g., Vietnamese), **TRANSLATE** it to professional, high-impact English.

    **DESIGN PHILOSOPHY: "CYBERPUNK BENTO & REACT BITS"**
    - Create a visually stunning, modern layout using **React Bits** components.
    - **Aesthetics:** Dark mode, high contrast, neon accents, glassmorphism.
    - **Layout:** Variable grid sizes. Mix small (1x1), medium (2x1), and large (2x2, 4x2) cards.

    **CORE INSTRUCTION: REACT COMPONENT NODES**
    - You are NOT limited to static HTML. You MUST use the provided **React Components** to create interactive elements.
    - **Priority:** Use "react-component" nodes for at least 50% of your custom nodes.
    - **Fallback:** Use "html" nodes for complex layouts that don't fit a specific component.

    **AVAILABLE COMPONENTS & PROPS (Strict Schema):**

    1. **GradientText** (Best for: Headings, Slogans)
       - \`colors\`: string[] (e.g., ["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"])
       - \`animationSpeed\`: number (default: 3)
       - \`showBorder\`: boolean (default: false)
       - \`className\`: string (e.g., "text-4xl font-bold")
       - \`children\`: string (The text content)

    2. **CountUp** (Best for: Stats, Years of Experience, Projects Completed)
       - \`to\`: number (The target number)
       - \`from\`: number (Start number, usually 0)
       - \`separator\`: string (e.g., ",")
       - \`direction\`: "up" | "down"
       - \`duration\`: number (e.g., 2)
       - \`className\`: string (e.g., "text-5xl font-bold text-white")
       - \`children\`: string (Label below the number, e.g., "Years Exp")

    3. **ShinyText** (Best for: Call-to-actions, Premium Labels)
       - \`text\`: string (The text content)
       - \`disabled\`: boolean (false)
       - \`speed\`: number (e.g., 3)
       - \`className\`: string (e.g., "text-lg font-medium")

    4. **DecryptedText** (Best for: Tech roles, "Hacker" vibes, Job Titles)
       - \`text\`: string (The text to reveal)
       - \`speed\`: number (e.g., 50)
       - \`maxIterations\`: number (e.g., 10)
       - \`className\`: string (e.g., "text-3xl font-mono font-bold text-white")
       - \`animateOn\`: "view" | "hover" | "both" (default: "view")

    5. **TiltedCard** (Best for: Profile Picture, Featured Project Image)
       - \`imageSrc\`: string (Use the provided \`processedImage\` or a placeholder)
       - \`altText\`: string
       - \`captionText\`: string (Optional caption)
       - \`containerHeight\`: string (e.g., "100%")
       - \`containerWidth\`: string (e.g., "100%")
       - \`imageHeight\`: string (e.g., "300px")
       - \`imageWidth\`: string (e.g., "300px")
       - \`rotateAmplitude\`: number (e.g., 12)
       - \`scaleOnHover\`: number (e.g., 1.1)
       - \`showMobileWarning\`: boolean (false)
       - \`showTooltip\`: boolean (true)
       - \`displayOverlayContent\`: boolean (true)
       - \`overlayContent\`: null (Keep null for simplicity)

    6. **SplitText** (Best for: Long statements, Bio intros)
       - \`text\`: string
       - \`className\`: string (e.g., "text-2xl font-semibold text-center")
       - \`delay\`: number (e.g., 100)
       - \`animationFrom\`: object ({ opacity: 0, transform: 'translate3d(0,50px,0)' })
       - \`animationTo\`: object ({ opacity: 1, transform: 'translate3d(0,0,0)' })
       - \`threshold\`: number (0.2)
       - \`rootMargin\`: string ("-50px")

    **REQUIRED CUSTOM NODES STRATEGY:**
    1.  **Hero Identity**: Use **DecryptedText** for the Job Title or **GradientText** for the Name.
    2.  **Visual Centerpiece**: Use **TiltedCard** for the main image.
    3.  **Key Metrics**: Use 2-3 **CountUp** components in a grid or separate small cards.
    4.  **Statement**: Use **SplitText** or **ShinyText** for a short bio or motto.

    **Process:**
    1.  **ANALYZE**: Identify the Persona.
    2.  **STRATEGIZE**: Plan a grid.
    3.  **GENERATE**:
        - Extract **Name**, **Title**, **Bio**, **Skills**, **Socials**.
        - Generate **ColorTheme** (Hex).
        - Create **CustomNodes**: An array of objects.
          - "colSpan": 1 to 4.
          - "rowSpan": 1 or 2.
          - "type": "react-component" (PREFERRED) or "html".
          - "component": Name of the component (e.g., "GradientText").
          - "props": Object containing the props.
          - "children": (Optional) Text content if the component uses children.

    Output Format:
    First, output your "THOUGHTS" block.
    Then, output the final "JSON" block.

    JSON Structure:
    {
      "name": "...",
      "title": "...",
      "bio": "...",
      "skills": [...],
      "socials": [...],
      "colorTheme": "#...",
      "customNodes": [
        {
          "colSpan": 2,
          "rowSpan": 2,
          "type": "react-component",
          "component": "TiltedCard",
          "props": {
            "imageSrc": "...",
            "altText": "Profile",
            "captionText": "Creative Director",
            "rotateAmplitude": 15,
            "scaleOnHover": 1.1
          }
        },
        {
          "colSpan": 2,
          "rowSpan": 1,
          "type": "react-component",
          "component": "GradientText",
          "props": {
            "colors": ["#ff00cc", "#3333ff", "#ff00cc"],
            "animationSpeed": 4,
            "className": "text-4xl font-bold"
          },
          "children": "Creative Developer"
        },
        {
          "colSpan": 1,
          "rowSpan": 1,
          "type": "react-component",
          "component": "CountUp",
          "props": {
            "to": 10,
            "className": "text-5xl font-bold text-white"
          },
          "children": "Years Exp"
        }
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
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
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

  } catch (error: unknown) {
    console.error("❌ Error generating portfolio:", error);

    // Better error messages
    let errorMessage = "Failed to generate portfolio";
    const err = error as Error;

    if (err?.message?.includes("API key")) {
      errorMessage = "Invalid API key. Please check your GEMINI_API_KEY in .env.local";
    } else if (err?.message?.includes("quota")) {
      errorMessage = "API quota exceeded. Please check your Gemini API usage.";
    } else if (err?.message) {
      errorMessage = err.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
