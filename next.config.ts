import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/poll",
  assetPrefix: "/poll",
  trailingSlash: false,
};

export default nextConfig;
