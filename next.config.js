/** @type {import('next').NextConfig} */


const isLocalDev = process.env?.LOCAL_DEV || false;

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "img-src 'self' data: https://i.ytimg.com; " +
              "media-src 'self' https://www.youtube.com https://d3tdwb735roscv.cloudfront.net;" +
              "frame-src https://www.youtube.com https://www.youtube-nocookie.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "connect-src 'self' https://www.youtube.com https://i.ytimg.com;",
          },
        ],
      },
    ];
  },
  build: {
    extend(config, {}) {
        config.node = {
            fs: 'empty'
        }
    }
  },
  output: "standalone",
  ...(isLocalDev ? {} : { assetPrefix: 'https://d3tdwb735roscv.cloudfront.net/static/1.0.0' }),
  swcMinify: true,
  productionBrowserSourceMaps: true,
  outputFileTracing: true,
  serverRuntimeConfig: {
    isExternalApi: true,
    ENV: process.env.ENV,
  },
  publicRuntimeConfig: {
    ENV: process.env.ENV,
    LOCAL_DEV: isLocalDev
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    esmExternals: true,
  },
  reactStrictMode: true,
  react: { useSuspense: false },
  images: {
    unoptimized: true,
  },
};

