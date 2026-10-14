const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Permite que o Expo empacote o arquivo .wasm do banco de dados na Web
config.resolver.assetExts.push('wasm');

module.exports = config;