//
// next.config.js for lockpage
//
module.exports = {
  eslint: {
    dirs: [
      'src',
    ],
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  pageExtensions: [
    'page.tsx',
    'page.ts',
    'page.jsx',
    'page.js',
    'api.tsx',
    'api.ts',
    'api.jsx',
    'api.js',
  ],
}
