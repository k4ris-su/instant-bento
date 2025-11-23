"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BentoCard } from "@/components/BentoCard";
import DOMPurify from "dompurify";
import GradientText from "@/components/GradientText";
import CountUp from "@/components/CountUp";
import ShinyText from "@/components/ShinyText";
import TiltedCard from "@/components/TiltedCard";
import DecryptedText from "@/components/DecryptedText";
import SplitText from "@/components/SplitText";
import SpotlightCard from "@/components/SpotlightCard";
import CircularText from "@/components/CircularText";
import Iridescence from "@/components/Iridescence";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import TrueFocus from "@/components/TrueFocus";

interface CustomNode {
  colSpan: number;
  rowSpan: number;
  type: "html" | "text" | "stat" | "react-component";
  content: string; // For HTML/Text
  component?: string; // For react-component
  props?: Record<string, unknown>; // For react-component
  children?: React.ReactNode; // For react-component
}

interface BentoGridProps {
  data: {
    name: string;
    title: string;
    bio: string;
    skills: string[];
    socials: { platform: string; url: string }[];
    stats?: { label: string; value: string }[];
    customNodes?: CustomNode[];
    processedImage: string;
    colorTheme: string;
  };
}

// Dynamic Component Renderer
const DynamicComponent = ({ node, safeData }: { node: CustomNode, safeData: { processedImage: string } }) => {
  if (node.type !== 'react-component' || !node.component) return null;

  const { component, props, children, content } = node;

  // Helper to get the best available text content and ensure it's a string
  const getText = () => {
    const rawText = children || props?.text || content || "";
    return String(rawText);
  };

  switch (component) {
    case 'GradientText':
      return (
        <div className="h-full w-full flex items-center justify-center p-6 font-sans">
          <GradientText {...props}>
            {getText() || "Gradient Text"}
          </GradientText>
        </div>
      );
    case 'CountUp':
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 font-sans">
          <div className="text-5xl font-bold text-white mb-2">
            <CountUp {...props} />
          </div>
          {(children || content) && <span className="text-zinc-400 text-sm uppercase tracking-widest">{getText()}</span>}
        </div>
      );
    case 'ShinyText':
      return (
        <div className="h-full w-full flex items-center justify-center p-6 font-sans">
          <ShinyText {...props} text={getText() || "Shiny Text"} />
        </div>
      );
    case 'TiltedCard':
       // Fix: Use processedImage if the AI suggests it or if missing
       const imageSrc = props?.imageSrc === 'processedImage' || !props?.imageSrc
         ? safeData.processedImage
         : props.imageSrc;

      return (
        <div className="h-full w-full flex items-center justify-center overflow-hidden font-sans">
          <TiltedCard
            {...props}
            imageSrc={imageSrc}
            captionText={props?.captionText ? String(props.captionText) : ""}
            altText={props?.altText ? String(props.altText) : "Portfolio Image"}
            containerHeight="100%"
            containerWidth="100%"
          />
        </div>
      );
    case 'DecryptedText':
      return (
        <div className="h-full w-full flex items-center justify-center p-6 font-sans">
          <DecryptedText {...props} text={getText() || "Decrypted"} />
        </div>
      );
    case 'SplitText':
      return (
        <div className="h-full w-full flex items-center justify-center p-6 font-sans">
          <SplitText threshold={0.1} {...props} text={getText() || "Split Text"} />
        </div>
      );
    case 'SpotlightCard':
      return (
        <SpotlightCard className="h-full w-full flex items-center justify-center p-6 font-sans" {...props}>
           <div className="relative z-10 text-center text-zinc-200">
             {getText() || "Spotlight Card"}
           </div>
        </SpotlightCard>
      );
    case 'CircularText':
      return (
        <div className="h-full w-full flex items-center justify-center p-6 font-sans overflow-hidden">
          <CircularText text={getText() || "Circular Text"} {...props} />
        </div>
      );
    case 'Iridescence':
      // Validate color prop to prevent crashes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let iridescenceColor = (props as any)?.color;
      if (!Array.isArray(iridescenceColor) || iridescenceColor.length !== 3) {
         iridescenceColor = [1, 1, 1]; // Default to white if invalid
      }

      return (
        <div className="h-full w-full relative overflow-hidden font-sans">
           <Iridescence {...props} color={iridescenceColor} />
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white mix-blend-overlay tracking-tighter">{getText()}</span>
           </div>
        </div>
      );
    case 'InfiniteScroll':
      // Ensure items is an array of strings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scrollItems = (props as any)?.items;
      const validItems = Array.isArray(scrollItems) ? scrollItems.map(String) : ["Item 1", "Item 2", "Item 3"];

      return (
        <div className="h-full w-full flex items-center justify-center overflow-hidden font-sans">
           <InfiniteScroll items={validItems} {...props} />
        </div>
      );
    case 'TrueFocus':
      return (
        <div className="h-full w-full flex items-center justify-center p-6 font-sans">
           <TrueFocus sentence={getText() || "True Focus"} {...props} />
        </div>
      );
    default:
      return <div className="p-4 text-red-500">Unknown Component: {component}</div>;
  }
};

export function BentoGrid({ data }: BentoGridProps) {
  // Fallback data
  const safeData = {
    name: data?.name || "Your Name",
    title: data?.title || "Professional",
    bio: data?.bio || "A passionate professional creating amazing experiences.",
    skills: data?.skills?.length > 0 ? data.skills : ["Design", "Innovation", "Strategy"],
    socials: data?.socials?.length > 0 ? data.socials : [],
    stats: data?.stats || [
      { label: "Experience", value: "2+ Years" },
      { label: "Projects", value: "10+" }
    ],
    customNodes: data?.customNodes || [],
    processedImage: data?.processedImage || "https://via.placeholder.com/300",
    colorTheme: data?.colorTheme || "#8400ff"
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-7xl mx-auto auto-rows-[minmax(180px,auto)] p-4"
    >
      {/* Header / Hero Card - Blended Avatar Style */}
      <motion.div variants={item} className="col-span-1 md:col-span-4 lg:col-span-4 row-span-2 relative group">
        <BentoCard className="h-full w-full relative overflow-hidden !p-0 border-none" translucent={true}>
          {/* Full Background Image with Zoom Effect */}
          <div className="absolute inset-0">
            <Image
              src={safeData.processedImage}
              alt={safeData.name}
              fill
              unoptimized
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient Overlay - Fades image into the UI at the bottom/left */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/50 to-transparent opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)] via-transparent to-transparent opacity-80" />
          </div>

          {/* Content - Floating on top */}
          <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10">
            <div className="space-y-4 max-w-2xl">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-[var(--foreground)] w-fit font-mono"
              >
                <span className="w-2 h-2 rounded-none bg-green-500 animate-pulse" />
                Open to opportunities
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[var(--foreground)] leading-[0.9]">
                {safeData.name}
              </h1>

              <p className="text-xl md:text-2xl text-[var(--muted)] font-medium tracking-tight flex items-center gap-3 font-mono">
                <span className="w-8 h-1 rounded-none" style={{ backgroundColor: safeData.colorTheme }} />
                {safeData.title}
              </p>
            </div>
          </div>
        </BentoCard>
      </motion.div>

      {/* Stats - Vertical Stack */}
      <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 flex flex-col gap-4">
        <BentoCard className="flex-1 flex flex-col justify-center items-center p-6 bg-zinc-100 text-zinc-900" translucent={false}>
          <span className="text-5xl font-bold mb-1 font-mono">{safeData.stats[0]?.value || "1+"}</span>
          <span className="text-sm font-medium opacity-80 uppercase tracking-wider font-mono">{safeData.stats[0]?.label || "Years"}</span>
        </BentoCard>
        <BentoCard className="flex-1 flex flex-col justify-center items-center p-6" translucent={true}>
          <span className="text-5xl font-bold mb-1 text-[var(--accent)] font-mono">{safeData.stats[1]?.value || "10+"}</span>
          <span className="text-sm text-zinc-400 uppercase tracking-wider font-mono">{safeData.stats[1]?.label || "Projects"}</span>
        </BentoCard>
      </motion.div>

      {/* Bio Card */}
      <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-3 row-span-1">
        <BentoCard className="h-full p-8 flex flex-col justify-center" translucent={true}>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 font-mono">
            <span className="w-1 h-6 rounded-none" style={{ backgroundColor: safeData.colorTheme }} />
            About
          </h3>
          <p className="text-lg leading-relaxed text-[var(--muted)]">
            {safeData.bio}
          </p>
        </BentoCard>
      </motion.div>

      {/* Socials */}
      <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-3 row-span-1">
         <BentoCard className="h-full p-6 flex flex-col justify-center" translucent={true}>
          <h3 className="text-sm font-medium text-[var(--muted)] mb-4 uppercase tracking-wider font-mono">Connect</h3>
          <div className="flex flex-wrap gap-3">
            {safeData.socials.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-sm hover:border-[var(--accent)] transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md"
              >
                <span className="font-medium group-hover:text-[var(--accent)] font-mono text-sm">{social.platform}</span>
                <svg className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            ))}
          </div>
        </BentoCard>
      </motion.div>

      {/* Skills - Masonry-ish */}
      <motion.div variants={item} className="col-span-1 md:col-span-4 lg:col-span-6 row-span-auto">
        <BentoCard className="h-full p-8" translucent={true}>
          <h3 className="text-lg font-semibold mb-6 font-mono">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {safeData.skills.map((skill, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-sm font-medium shadow-sm hover:scale-105 transition-transform cursor-default font-mono"
                style={{
                  borderLeft: index % 3 === 0 ? `2px solid ${safeData.colorTheme}` : undefined
                }}
              >
                {skill}
              </div>
            ))}
          </div>
        </BentoCard>
      </motion.div>

      {/* Custom HTML Nodes from AI - These are the stars of the show */}
      {safeData.customNodes.map((node, index) => {
        // Determine if we should remove the default card styling for full-bleed visual components
        const isVisualComponent = node.type === 'react-component' &&
          ['Iridescence', 'TiltedCard', 'SpotlightCard'].includes(node.component || '');

        if (isVisualComponent) {
             return (
                <motion.div
                  key={`custom-${index}`}
                  variants={item}
                  className={`
                    col-span-1
                    md:col-span-${Math.min(node.colSpan, 4)}
                    lg:col-span-${Math.min(node.colSpan, 6)}
                    row-span-${node.rowSpan}
                    relative rounded-sm overflow-hidden h-full w-full transition-all duration-500 hover:scale-[1.01]
                  `}
                >
                   <DynamicComponent node={node} safeData={safeData} />
                </motion.div>
             )
        }

        return (
        <motion.div
          key={`custom-${index}`}
          variants={item}
          className={`
            col-span-1
            md:col-span-${Math.min(node.colSpan, 4)}
            lg:col-span-${Math.min(node.colSpan, 6)}
            row-span-${node.rowSpan}
          `}
        >
          <BentoCard
            className="h-full overflow-hidden"
            noPadding={true}
            translucent={true}
          >
            {node.type === 'html' ? (
               <div
                 className="h-full w-full p-6 md:p-8"
                 dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(node.content) }}
               />
            ) : node.type === 'react-component' ? (
               <DynamicComponent node={node} safeData={safeData} />
            ) : (
               <div className="h-full w-full p-6 flex items-center justify-center text-[var(--muted)]">
                 {node.content}
               </div>
            )}
          </BentoCard>
        </motion.div>
      )})}
    </motion.div>
  );
}
