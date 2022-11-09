/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  serverRuntimeConfig: process.env,
  experimental: {
    appDir: false,
  },
  output: 'standalone',
}

module.exports = nextConfig
