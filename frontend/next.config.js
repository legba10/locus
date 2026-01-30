const webpack = require('webpack')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.(test|spec)\.[jt]sx?$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /jest\.setup\.tsx?$/,
      })
    )
    return config
  },
};

module.exports = nextConfig;
