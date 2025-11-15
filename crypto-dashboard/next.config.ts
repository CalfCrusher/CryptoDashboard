import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to avoid monorepo/lockfile inference warnings
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
