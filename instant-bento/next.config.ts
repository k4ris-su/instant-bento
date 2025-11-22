import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Allow local network access without warnings
  allowedDevOrigins: ["bentou.k4ris.com", "localhost:3000", "0.0.0.0:3000"],
};

export default nextConfig;
