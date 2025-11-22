# Instant Bento 🍱

**Instant Bento** is an AI-powered portfolio generator that transforms a simple photo and text description into a professional, high-end personal website in seconds.

## Key Features

-   **AI Agent Workflow:** Powered by **Gemini 3 Pro** for intelligent content strategy and **Gemini 2.5 Flash** for cinematic image processing.
-   **Bento Grid Layout:** A modern, responsive grid architecture inspired by Apple's bento design language.
-   **Glassmorphism Design:** Premium UI with blurred backgrounds, translucent cards, and vibrant gradients.
-   **Freestyle Custom Nodes:** The AI generates custom HTML/Tailwind components on the fly to visualize unique user data (awards, stats, skills).
-   **Cinematic Avatar:** Automatically processes user photos into high-quality, professionally lit **21:9 ultrawide** header images.
-   **Streaming Architecture:** Real-time "thinking" feedback loop with buffered NDJSON streaming for a seamless user experience.

## Tech Stack

-   **Framework:** Next.js 15 (App Router)
-   **Styling:** Tailwind CSS v4 + Framer Motion
-   **AI/LLM:** Google Gemini API
-   **Language:** TypeScript

## Getting Started

1.  Install dependencies: `pnpm install`
2.  Set up environment: Add `GEMINI_API_KEY` to `.env.local`
3.  Run locally: `pnpm dev`
4.  Run for network access (background): `pnpm dev:host` (Logs saved to `.dev-host.log`)
