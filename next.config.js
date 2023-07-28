const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const pythonAPI = 'https://hyfbq7acyerjsgmqdbjjprzs5e0wkfrz.lambda-url.ap-southeast-1.on.aws/';

module.exports = withBundleAnalyzer({
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async rewrites() {
    return [
      {
        source: '/api/py_tok',
        destination: pythonAPI,
      },
    ];
  },
});
