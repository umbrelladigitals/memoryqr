import path from "path";
import fs from "fs";

const nextConfig = {
  distDir: "dist",
  productionBrowserSourceMaps: false, // Production'da source map'leri kapatıyoruz
  reactStrictMode: true, // Production için strict mode açıyoruz
  poweredByHeader: false, // X-Powered-By header'ını kaldırıyoruz
  compress: true, // Gzip sıkıştırma
  typescript: {
    ignoreBuildErrors: true, // Build sırasında TypeScript hatalarını geçici olarak ignore et
  },
  eslint: {
    ignoreDuringBuilds: true, // Build sırasında ESLint hatalarını geçici olarak ignore et
  },
  env: {},
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      'lucide-react'
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  // Turbopack stable config
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Only use webpack config when not using turbopack
  webpack: (config, options) => {
    // Skip webpack config when using turbopack
    if (options.isServer || process.env.TURBOPACK) {
      return config;
    }
    
    config.devtool =
      process.env.NODE_ENV === "production" ? "source-map" : false;
    config.optimization = {
      ...config.optimization,
      minimize: false,
    };
    config.plugins = config.plugins || [];
    config.module = config.module || { rules: [] };
    config.module.rules = config.module.rules || [];

    const fileLoaderRule = config.module.rules.find(
      (rule) =>
        typeof rule === "object" &&
        rule !== null &&
        rule.test instanceof RegExp &&
        rule.test.test(".svg"),
    );
    if (fileLoaderRule && typeof fileLoaderRule === "object") {
      fileLoaderRule.exclude = /\.svg$/i;
    }
    config.module.rules.push(
      {
        test: /\.svg$/i,
        resourceQuery: /url/,
        type: "asset/resource",
      },
    );

    return config;
  },
};

export default nextConfig;
