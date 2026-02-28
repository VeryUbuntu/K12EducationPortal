import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/eduflow/api/:path*',
        destination: 'http://127.0.0.1:8005/api/:path*',
      },
    ]
  },
};

export default nextConfig;
