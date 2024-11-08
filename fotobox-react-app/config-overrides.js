// config-overrides.js
const webpack = require('webpack');

module.exports = function override(config) {
  // Fallback für `process`-Modul hinzufügen
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "process": require.resolve("process/browser.js") // `.js`-Erweiterung hinzufügen
  };

  // DevServer-Header für Cross-Origin Isolation
  config.devServer = {
    ...config.devServer,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  };

  // Plugin für `process`-Zugriff bereitstellen
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser.js' //.JS WIRD BENÖTIGT
    }),
  ]);

  return config;
};
