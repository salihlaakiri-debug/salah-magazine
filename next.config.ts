import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "salah-magazine.vercel.app",
      },
    ],
  },
};

export default nextConfig;
