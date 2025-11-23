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

interface CustomNode {
  colSpan: number;
  rowSpan: number;
  type: "html" | "text" | "stat" | "react-component";
  content: string; // For HTML/Text
  component?: string; // For react-component
  props?: any; // For react-component
  children?: any; // For react-component
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
const DynamicComponent = ({ node }: { node: CustomNode }) => {
  if (node.type !== 'react-component' || !node.component) return null;

  const { component, props, children } = node;

  switch (component) {
    case 'GradientText':
      return (
        <div className="h-full w-full flex items-center justify-center p-6 bg-zinc-900/50">
          <GradientText {...props}>
            {children || props.text || "Gradient Text"}
          </GradientText>
        </div>
      );
    case 'CountUp':
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-zinc-900/50">
          <div className="text-5xl font-bold text-white mb-2">
            <CountUp {...props} />
          </div>
          {children && <span className="text-zinc-400 text-sm uppercase tracking-widest">{children}</span>}
        </div>
      );
    case 'ShinyText':
      return (
        <div className="h-full w-full flex items-center justify-center p-6 bg-zinc-900/50">
          <ShinyText {...props} text={children || props.text || "Shiny Text"} />
        </div>
      );
    case 'TiltedCard':
      return (
        <div className="h-full w-full flex items-center justify-center bg-zinc-900/50 overflow-hidden">
          <TiltedCard {...props} />
        </div>
      );
    case 'DecryptedText':
      return (
        <div className="h-full w-full flex items-center justify-center p-6 bg-zinc-900/50">
          <DecryptedText {...props} text={children || props.text || "Decrypted"} />
        </div>
      );
    case 'SplitText':
      return (
        <div className="h-full w-full flex items-center justify-center p-6 bg-zinc-900/50">
          <SplitText {...props} text={children || props.text || "Split Text"} />
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
    colorTheme: data?.colorTheme || "#3B82F6"
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
      className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-7xl mx-auto auto-rows-[minmax(180px,auto)]"
    >
      {/* Header / Hero Card - Blended Avatar Style */}
      <motion.div variants={item} className="col-span-1 md:col-span-4 lg:col-span-4 row-span-2 relative group">
        {/* Main Container - No Border/Background for "Floating" effect */}
        <div className="h-full w-full relative rounded-3xl overflow-hidden">
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
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-[var(--foreground)] w-fit"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Open to opportunities
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[var(--foreground)] leading-[0.9]">
                {safeData.name}
              </h1>

              <p className="text-xl md:text-2xl text-[var(--muted)] font-medium tracking-tight flex items-center gap-3">
                <span className="w-8 h-1 rounded-full" style={{ backgroundColor: safeData.colorTheme }} />
                {safeData.title}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats - Vertical Stack */}
      <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 flex flex-col gap-4">
        <BentoCard className="flex-1 flex flex-col justify-center items-center p-6 bg-[var(--foreground)] text-[var(--background)]">
          <span className="text-5xl font-bold mb-1">{safeData.stats[0]?.value || "1+"}</span>
          <span className="text-sm opacity-80 uppercase tracking-wider">{safeData.stats[0]?.label || "Years"}</span>
        </BentoCard>
        <BentoCard className="flex-1 flex flex-col justify-center items-center p-6">
          <span className="text-5xl font-bold mb-1 text-[var(--accent)]">{safeData.stats[1]?.value || "10+"}</span>
          <span className="text-sm text-[var(--muted)] uppercase tracking-wider">{safeData.stats[1]?.label || "Projects"}</span>
        </BentoCard>
      </motion.div>

      {/* Bio Card */}
      <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-3 row-span-1">
        <BentoCard className="h-full p-8 flex flex-col justify-center">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full" style={{ backgroundColor: safeData.colorTheme }} />
            About
          </h3>
          <p className="text-lg leading-relaxed text-[var(--muted)]">
            {safeData.bio}
          </p>
        </BentoCard>
      </motion.div>

      {/* Socials */}
      <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-3 row-span-1">
         <BentoCard className="h-full p-6 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-[var(--muted)] mb-4 uppercase tracking-wider">Connect</h3>
          <div className="flex flex-wrap gap-3">
            {safeData.socials.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-5 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md"
              >
                <span className="font-medium group-hover:text-[var(--accent)]">{social.platform}</span>
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
        <BentoCard className="h-full p-8">
          <h3 className="text-lg font-semibold mb-6">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {safeData.skills.map((skill, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-gradient-to-br from-[var(--background)] to-[var(--card)] border border-[var(--border)] rounded-lg text-sm font-medium shadow-sm hover:scale-105 transition-transform cursor-default"
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
      {safeData.customNodes.map((node, index) => (
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
          <BentoCard className="h-full overflow-hidden" noPadding={true}>
            {node.type === 'html' ? (
               <div
                 className="h-full w-full"
                 dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(node.content) }}
               />
            ) : node.type === 'react-component' ? (
               <DynamicComponent node={node} />
            ) : (
               <div className="h-full w-full p-6 flex items-center justify-center text-[var(--muted)]">
                 {node.content}
               </div>
            )}
          </BentoCard>
        </motion.div>
      ))}
    </motion.div>
  );
}
