/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://hris-api-kappa.vercel.app/api/:path*' // target API
      }
    ]
  }
}

module.exports = nextConfig
