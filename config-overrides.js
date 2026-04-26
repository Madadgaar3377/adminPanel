const webpack = require("webpack");
const path = require("path");

module.exports = function override(config) {
  const processPath = path.resolve(__dirname, "node_modules/process/browser.js");
  
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "util": require.resolve("util/"),
    "path": require.resolve("path-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "stream": require.resolve("stream-browserify"),
    "url": require.resolve("url/"),
    "crypto": require.resolve("crypto-browserify"),
    "assert": require.resolve("assert/"),
    "buffer": require.resolve("buffer/"),
    "process": processPath,
  };
  
  config.resolve.alias = {
    ...config.resolve.alias,
    "process/browser": processPath,
  };
  
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ];
  
  return config;
};
