const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config");

const path = require("path");
const config = getDefaultConfig(__dirname);
const root = path.resolve(__dirname, "../..");
config.watchFolders = [path.join(root, "packages"), path.join(root, "tooling"), path.join(root, "node_modules")];

// Force singletons to resolve from apps/mobile (the linked workspace packages would otherwise pull their own copies).
const SINGLETONS = /^(react(\/.*)?|react-native|@tanstack\/react-query|@tanstack\/query-core|@trpc\/(client|server|tanstack-react-query))$/;
const origin = path.join(__dirname, "package.json");

config.resolver.unstable_enablePackageExports = true;

// SVG transformer: allow importing .svg files as React components
const { transformer, resolver } = config;
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};
config.resolver = {
  ...resolver,
  assetExts: (resolver.assetExts ?? []).filter((ext) => ext !== "svg"),
  sourceExts: [...(resolver.sourceExts ?? []), "svg"],
  resolveRequest: (context, name, platform) => {
    // Dev lazy chunks (dynamic import() of workspace packages, e.g. i18n JSON) are requested relative to the
    // monorepo root but resolved from apps/mobile; map them back to the real file.
    if (name.startsWith("./packages/")) name = path.join(root, name);
    return context.resolveRequest(
      SINGLETONS.test(name) ? { ...context, originModulePath: origin } : context,
      name,
      platform,
    );
  },
};

module.exports = withUniwindConfig(wrapWithReanimatedMetroConfig(config), {
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-env.d.ts",
});
