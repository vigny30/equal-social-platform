/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  basePath: process.env.NODE_ENV === 'production' ? '/equal-social-platform' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/equal-social-platform' : '',
}

export default nextConfig
