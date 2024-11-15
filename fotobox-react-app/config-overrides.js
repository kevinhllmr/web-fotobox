// config-overrides.js
const webpack = require('webpack');

module.exports = function override(config) {
  // Fallback für `process`-Modul hinzufügen
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "process": require.resolve("process/browser.js") // `.js`-Erweiterung hinzufügen
  };

  // config-overrides.js
  module.exports = {
  // Extend/override the dev server configuration used by CRA
  // See: https://github.com/timarney/react-app-rewired#extended-configuration-options
  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      // Create the default config by calling configFunction with the proxy/allowedHost parameters
      // Default config: https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/webpackDevServer.config.js
      const config1 = configFunction(proxy, allowedHost);
      // Set X-Frame-Options header
      config1.headers = {      
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp"}
      return config1;
    };
  },
};
  
  // DevServer-Header für Cross-Origin Isolation
 /* config.devServer = {
    ...config.devServer,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  };*/
  

  // Plugin für `process`-Zugriff bereitstellen
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser.js' //.JS WIRD BENÖTIGT
    }),
  ]);

  module.exports = {
    
}

  return config;
};
