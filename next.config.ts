import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-pdf uses Node.js-only APIs in server routes — keep it external
  serverExternalPackages: ['@react-pdf/renderer'],
};

export default nextConfig;
