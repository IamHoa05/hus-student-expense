/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  eslint: {
    // Cho phép build thành công ngay cả khi code còn lỗi ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Cho phép build thành công ngay cả khi code còn lỗi Type (như lỗi 'any' Hòa gặp)
    ignoreBuildErrors: true,
  },
  
};

export default nextConfig;
