const path = require("path");

const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  "@": __dirname,
};

config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(__dirname, "app"),
  path.resolve(__dirname, "components"),
  path.resolve(__dirname, "hooks"),
  path.resolve(__dirname, "contexts"),
  path.resolve(__dirname, "constants"),
];

module.exports = config;
