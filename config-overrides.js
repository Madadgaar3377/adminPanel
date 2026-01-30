const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
  const processPath = path.resolve(__dirname, "node_modules/process/browser.js");
  
  // Add process polyfill fallback
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "process": processPath,
  };
  
  // Add alias for process/browser
  config.resolve.alias = {
    ...config.resolve.alias,
    "process/browser": processPath,
  };
  
  // Provide process globally
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: processPath,
    }),
  ];
  
  return config;
};
