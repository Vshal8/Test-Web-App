import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The companies API is request-scoped and backed by process memory.
  // Leaving Cache Components off avoids freezing GET responses at build time.
  cacheComponents: false,
};

export default nextConfig;
