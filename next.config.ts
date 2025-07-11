import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for vega-canvas trying to import 'canvas'
    if (!isServer) {
      config.resolve.fallback = {
        canvas: false,
      };
    }
    return config;
  },
};

export default nextConfig;
