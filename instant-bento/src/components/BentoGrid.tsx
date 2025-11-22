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
    processedImage: string;
    colorTheme: string;
  };
}

export function BentoGrid({ data }: BentoGridProps) {
  console.log("🎨 BentoGrid received data:", data);
  
  // Fallback data if something is missing
  const safeData = {
    name: data?.name || "Your Name",
    title: data?.title || "Professional",
    bio: data?.bio || "A passionate professional creating amazing experiences.",
    skills: data?.skills?.length > 0 ? data.skills : ["Skills", "To Be", "Added"],
    socials: data?.socials?.length > 0 ? data.socials : [
      { platform: "LinkedIn", url: "https://linkedin.com" },
      { platform: "GitHub", url: "https://github.com" }
    ],
    processedImage: data?.processedImage || "https://via.placeholder.com/300",
    colorTheme: data?.colorTheme || "#3B82F6"
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
    >
      {/* Profile Image - Large Card */}
      <motion.div variants={item} className="md:col-span-2 lg:col-span-2 lg:row-span-2">
        <BentoCard className="h-full flex flex-col items-center justify-center text-center p-8">
          <img
            src={safeData.processedImage}
            alt={safeData.name}
            className="w-48 h-48 rounded-full object-cover mb-6 shadow-xl"
          />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {safeData.name}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            {safeData.title}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {safeData.socials.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {social.platform}
              </a>
            ))}
          </div>
        </BentoCard>
      </motion.div>

      {/* Bio Card */}
      <motion.div variants={item} className="md:col-span-1 lg:col-span-2 lg:row-span-1">
        <BentoCard className="h-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            About Me
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {safeData.bio}
          </p>
        </BentoCard>
      </motion.div>

      {/* Skills Card */}
      <motion.div variants={item} className="md:col-span-1 lg:col-span-1 lg:row-span-1">
        <BentoCard className="h-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Skills
          </h3>
          <div className="space-y-2">
            {safeData.skills.map((skill, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                {skill}
              </div>
            ))}
          </div>
        </BentoCard>
      </motion.div>

      {/* Color Theme Card */}
      <motion.div variants={item} className="md:col-span-1 lg:col-span-1 lg:row-span-1">
        <BentoCard className="h-full flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Theme Color
          </h3>
          <div
            className="w-16 h-16 rounded-full shadow-lg"
            style={{ backgroundColor: safeData.colorTheme }}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {safeData.colorTheme}
          </p>
        </BentoCard>
      </motion.div>

      {/* Stats Card */}
      <motion.div variants={item} className="md:col-span-1 lg:col-span-1 lg:row-span-1">
        <BentoCard className="h-full flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {safeData.skills.length}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Technologies
          </p>
        </BentoCard>
      </motion.div>

      {/* Contact Card */}
      <motion.div variants={item} className="md:col-span-1 lg:col-span-1 lg:row-span-1">
        <BentoCard className="h-full flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Let's Connect
          </h3>
          <div className="space-y-2">
            {safeData.socials.slice(0, 2).map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                {social.platform}
              </a>
            ))}
          </div>
        </BentoCard>
      </motion.div>
    </motion.div>
  );
}