const { getDefaultConfig } = require('expo/metro-config');
const { createSentryMetroSerializer } = require('@sentry/react-native/dist/js/tools/sentryMetroSerializer');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '../');
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Añadir la configuración de Sentry manualmente
config.serializer = {
  ...config.serializer,
  customSerializer: createSentryMetroSerializer(),
};

module.exports = config;
