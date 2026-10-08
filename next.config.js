module.exports = {
  experimental: {
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "courses-top.ru",
        port: "",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              prettier: false,
              svgo: true,
              svgoConfig: {
                plugins: [
                  {
                    name: "preset-default",
                    params: {
                      override: {
                        removeViewBox: false,
                      },
                    },
                  },
                ],
              },
              titleProp: true,
            },
          },
        ],
        as: "*.js",
      },
    },
  },
};
