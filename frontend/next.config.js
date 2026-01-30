/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // PRODUCTION: Only Supabase Storage allowed
    // DO NOT add unsplash, picsum or any mock sources
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
