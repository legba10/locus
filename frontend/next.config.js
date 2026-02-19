/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "zfaryzbrjdnelujpxdtl.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "zfarzybrjdnelujpxdtl.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  // ТЗ-2, ТЗ-4: нормализованные роуты кабинета. В настройках только Аккаунт, Безопасность, Уведомления, Интерфейс.
  async redirects() {
    return [
      { source: "/create", destination: "/create-listing", permanent: false },
      { source: "/owner/dashboard", destination: "/dashboard/listings/create", permanent: false, has: [{ type: "query", key: "tab", value: "add" }] },
      { source: "/profile/income", destination: "/profile/finance", permanent: false },
      { source: "/profile/payments", destination: "/profile/settings", permanent: false },
      { source: "/profile/docs", destination: "/profile/settings", permanent: false },
    ];
  },
};

module.exports = nextConfig;
