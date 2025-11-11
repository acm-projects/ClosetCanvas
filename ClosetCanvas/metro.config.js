const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts.push("svg");
config.resolver.unstable_conditionNames = ['require', 'default', 'browser'];
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
