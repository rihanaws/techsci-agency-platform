import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@notionhq/client', '@prisma/client'],
};

export default nextConfig;
