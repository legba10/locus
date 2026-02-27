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
  // ТЗ-27: единая навигация — только /profile. Удаление дублей /dashboard.
  async redirects() {
    return [
      { source: "/create", destination: "/profile/listings/create", permanent: false },
      { source: "/add", destination: "/profile/listings/create", permanent: false },
      { source: "/owner/dashboard", destination: "/profile/listings/create", permanent: false, has: [{ type: "query", key: "tab", value: "add" }] },
      { source: "/profile/income", destination: "/profile/finance", permanent: false },
      { source: "/profile/payments", destination: "/profile/settings", permanent: false },
      { source: "/profile/docs", destination: "/profile/settings", permanent: false },
      { source: "/listing/:id", destination: "/listings/:id", permanent: false },
      { source: "/dashboard", destination: "/profile", permanent: false },
      { source: "/dashboard/listings", destination: "/profile/listings", permanent: false },
      { source: "/dashboard/listings/create", destination: "/profile/listings/create", permanent: false },
      { source: "/dashboard/billing", destination: "/profile/finance", permanent: false },
      { source: "/dashboard/promo", destination: "/profile/finance", permanent: false },
      { source: "/dashboard/profile", destination: "/profile/settings", permanent: false },
      { source: "/dashboard/settings", destination: "/profile/settings", permanent: false },
      { source: "/dashboard/messages", destination: "/messages", permanent: false },
      { source: "/bookings", destination: "/profile/bookings", permanent: false },
      { source: "/search", destination: "/listings", permanent: false },
      { source: "/profile/sessions", destination: "/profile/security", permanent: false },
      { source: "/profile/analytics/stats", destination: "/profile/analytics", permanent: false },
    ];
  },
  // ТЗ-30: кабинет в /profile; страницы profile/listings, bookings и т.д. — реальные, без rewrites
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
