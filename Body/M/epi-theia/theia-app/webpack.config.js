/**
 * This file can be edited to customize webpack configuration.
 * To reset delete this file and rerun theia build again.
 */
// @ts-check
const path = require('path');
const webpack = require('webpack');
const configs = require('./gen-webpack.config.js');
const nodeConfig = require('./gen-webpack.node.config.js');

/**
 * Expose bundled modules on window.theia.moduleName namespace, e.g.
 * window['theia']['@theia/core/lib/common/uri'].
 * Such syntax can be used by external code, for instance, for testing.
configs[0].module.rules.push({
    test: /\.js$/,
    loader: require.resolve('@theia/application-manager/lib/expose-loader')
}); */

const stubs = path.resolve(__dirname, 'stubs');

nodeConfig.nativePlugin.nativeBinding(
    'drivelist',
    path.join(stubs, 'drivelist-bindings.js')
);

nodeConfig.config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
        /[\\/]build[\\/]Release[\\/]keytar\.node$/,
        path.join(stubs, 'keytar-native.js')
    )
);

// Node-only modules pulled into the FRONTEND bundle by extensions that
// accidentally import them in `common/` files (e.g. `@pratibimba/m4-nara`'s
// `common/nara-surface.ts` → `node:fs/promises`, `node:path`). Stub them to
// `false` in the frontend resolve.fallback and redirect node:-prefixed
// imports to the empty stub. Matches the equivalent treatment in
// `electron-app/webpack.config.js`.
const nodeStub = path.resolve(stubs, 'drivelist-bindings.js');
for (const cfg of configs) {
    cfg.resolve = cfg.resolve || {};
    cfg.resolve.fallback = Object.assign({}, cfg.resolve.fallback, {
        fs: false,
        'fs/promises': false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        child_process: false,
        net: false,
        tls: false,
        http: false,
        https: false,
        url: false,
        zlib: false
    });
    cfg.plugins = cfg.plugins || [];
    cfg.plugins.push(new webpack.NormalModuleReplacementPlugin(
        /^node:(fs|fs\/promises|path|os|crypto|stream|child_process|net|tls|http|https|url|zlib|util|events|buffer|assert)$/,
        nodeStub
    ));
}

module.exports = [
    ...configs,
    nodeConfig.config
];
