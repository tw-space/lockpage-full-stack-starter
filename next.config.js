module.exports = {
  eslint: {
    dirs: [
      'server',
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
  // webpack: (config, { isServer }) => {
  //   // Fixes npm packages that depend on `fs` module
  //   if (!isServer) {
  //     config.node = {
  //       fs: 'empty'
  //     }
  //   }

  //   return config
  // }
}
