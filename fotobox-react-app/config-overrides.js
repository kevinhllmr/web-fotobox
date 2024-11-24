const webpack = require('webpack');

module.exports = function override(config) {
  // Fallbacks für Node.js-Module, die im Browser nicht verfügbar sind
  config.resolve.fallback = {
    ...config.resolve.fallback,
    process: require.resolve('process/browser.js'), // Für `process`-Modul
    buffer: require.resolve('buffer/'),         // Falls Buffer benötigt wird
    fs: false,                                  // Deaktiviere fs, da es im Browser nicht unterstützt wird
  };

  // WebAssembly- und Cross-Origin-Unterstützung aktivieren
  config.experiments = {
    ...config.experiments,
    asyncWebAssembly: true, // Aktiviert asynchrone WebAssembly-Unterstützung
    topLevelAwait: true,    // Unterstützt await auf oberster Ebene
  };

  // DevServer-Header für Cross-Origin Isolation (notwendig für WebAssembly)
  config.devServer = {
    ...config.devServer,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  };

  // Plugins hinzufügen, um `process` und andere globale Variablen bereitzustellen
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser.js', // Stellt das `process`-Modul bereit
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'], // Stellt `Buffer` bereit
    }),
  ]);

  return config;
};
