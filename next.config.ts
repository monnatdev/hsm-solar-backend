import type { NextConfig } from "next";
import path from "path";

function getR2Hostname(): string | null {
  try {
    const url = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
    return url ? new URL(url).hostname : null
  } catch {
    return null
  }
}

const r2Hostname = getR2Hostname()

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: r2Hostname
      ? [{ protocol: "https", hostname: r2Hostname }]
      : [{ protocol: "https", hostname: "*.r2.dev" }],
  },
};

export default nextConfig;
