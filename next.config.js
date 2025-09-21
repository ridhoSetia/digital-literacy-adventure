/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        // HOSTNAME BARU DITAMBAHKAN DI SINI
        protocol: 'https',
        hostname: 'bkhgdkyodbllzwxpjaqx.supabase.co', 
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;