import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "i1.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "i2.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "i3.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "i4.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
    // Optimize for high-quality images
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [
      16, 32, 48, 64, 96, 128, 256, 384, 400, 440, 500, 560, 640, 750, 828,
      1080, 1200,
    ],
    // Enable dangerouslyAllowSVG if needed (not recommended)
    // dangerouslyAllowSVG: true,
    // Enable contentDispositionType if needed
    // contentDispositionType: 'attachment',
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://www.youtube.com",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "rizwannur.xyz"],
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
