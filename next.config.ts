import type { NextConfig } from "next";

const nextConfig: NextConfig = process.env.NEXT_STATIC_EXPORT === "true"
  ? { output: "export" }
  : {};

export default nextConfig;
