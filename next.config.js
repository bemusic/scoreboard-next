/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  serverRuntimeConfig: process.env,
  experimental: {
    appDir: false,
  },
}

module.exports = nextConfig
