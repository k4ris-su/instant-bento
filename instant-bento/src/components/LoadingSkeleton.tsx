"use client";

import { motion } from "framer-motion";

export function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-semibold text-[var(--foreground)] mb-2"
        >
          ✨ Creating your portfolio...
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[var(--muted)]"
        >
          This usually takes 3-5 seconds
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Profile Image Skeleton */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-2">
          <div className="rounded-2xl bg-[var(--card)] p-8 shadow-soft border border-[var(--border)] h-full">
            <div className="animate-pulse">
              <div className="w-48 h-48 bg-[var(--border)] rounded-full mx-auto mb-6"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 mx-auto w-3/4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 mx-auto w-1/2"></div>
              <div className="flex justify-center gap-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Skeleton */}
        <div className="md:col-span-1 lg:col-span-2 lg:row-span-1">
          <div className="rounded-2xl bg-[var(--card)] p-6 shadow-soft border border-[var(--border)] h-full">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 w-1/3"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-4/5"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Skeleton */}
        <div className="md:col-span-1 lg:col-span-1 lg:row-span-1">
          <div className="rounded-2xl bg-[var(--card)] p-6 shadow-soft border border-[var(--border)] h-full">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 w-1/2"></div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Color Skeleton */}
        <div className="md:col-span-1 lg:col-span-1 lg:row-span-1">
          <div className="rounded-2xl bg-[var(--card)] p-6 shadow-soft border border-[var(--border)] h-full">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 w-3/4 mx-auto"></div>
              <div className="w-16 h-16 bg-[var(--border)] rounded-full mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="md:col-span-1 lg:col-span-1 lg:row-span-1">
          <div className="rounded-2xl bg-[var(--card)] p-6 shadow-soft border border-[var(--border)] h-full">
            <div className="animate-pulse text-center">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 w-12 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-20 mx-auto"></div>
            </div>
          </div>
        </div>

        {/* Contact Skeleton */}
        <div className="md:col-span-1 lg:col-span-1 lg:row-span-1">
          <div className="rounded-2xl bg-[var(--card)] p-6 shadow-soft border border-[var(--border)] h-full">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 w-3/4 mx-auto"></div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
