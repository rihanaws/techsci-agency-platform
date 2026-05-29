import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@notionhq/client', '@prisma/client'],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
