import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Allow HTTP from any host
      {
        protocol: 'http',
        hostname: '**',
      },
      // Allow HTTPS from any host
      {
        protocol: 'https',
        hostname: '**',
      },
      // Allow localhost (development)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000', // or your dev server port
      },
      // Allow local network IPs (optional)
      {
        protocol: 'http',
        hostname: '192.168.**.**', // Adjust for your local network
      },
    ],
    // Enable dangerouslyAllowSVG if needed (not recommended)
    // dangerouslyAllowSVG: true,
    // Enable contentDispositionType if needed
    // contentDispositionType: 'attachment',
  },
};

export default nextConfig;