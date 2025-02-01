const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add polyfills for Node core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve('stream-browserify'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify/browser'),
    buffer: require.resolve('buffer'),  // Add Buffer polyfill
  };

  // Add ProvidePlugin to inject Buffer globally
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],  // Provide Buffer globally
    }),
  ];

  // Exclude source-map-loader warnings for certain modules
  config.module.rules = config.module.rules.map(rule => {
    if (rule.loader && rule.loader.includes('source-map-loader')) {
      return {
        ...rule,
        exclude: [
          /node_modules\/ethereumjs-util/,
          /node_modules\/xhr2-cookies/,
          /node_modules\/eth-json-rpc-filters/,
          /node_modules\/eth-rpc-errors/,
          // Add other problematic modules as needed
        ]
      };
    }
    return rule;
  });

  // Ignore specific warnings
  config.ignoreWarnings = [
    (warning) =>
      warning.message.includes("Failed to parse source map from"),
  ];

  return config;
};
