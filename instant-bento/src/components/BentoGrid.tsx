"use client";

import { motion } from "framer-motion";
import { BentoCard } from "@/components/BentoCard";

interface BentoGridProps {
  data: {
    name: string;
    title: string;
    bio: string;
    skills: string[];
    socials: { platform: string; url: string }[];
    stats?: { label: string; value: string }[];
    processedImage: string;
    colorTheme: string;
  };
}

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
      className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-7xl mx-auto auto-rows-[minmax(180px,auto)]"
    >
      {/* Header / Hero Card - Spans full width on mobile, large on desktop */}
      <motion.div variants={item} className="col-span-1 md:col-span-4 lg:col-span-4 row-span-2">
        <BentoCard className="h-full relative overflow-hidden group">
          <div 
            className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
            style={{ backgroundColor: safeData.colorTheme }}
          />
          <div className="relative z-10 h-full flex flex-col md:flex-row items-center md:items-end gap-6 p-8">
            <img
              src={safeData.processedImage}
              alt={safeData.name}
              className="w-32 h-32 md:w-48 md:h-48 rounded-2xl object-cover shadow-2xl ring-4 ring-white/20"
            />
            <div className="text-center md:text-left space-y-2 mb-2 flex-1">
              <div className="inline-block px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-medium mb-2 backdrop-blur-sm">
                Available for work
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--foreground)]">
                {safeData.name}
              </h1>
              <p className="text-xl md:text-2xl text-[var(--muted)] font-medium">
                {safeData.title}
              </p>
            </div>
          </div>
        </BentoCard>
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
    </motion.div>
  );
}
