module.exports = function (api) {
  api.cache(true);

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'react' }]],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/features': './src/features',
            '@/shared': './src/shared',
            '@/components': './src/shared/components',
            '@/hooks': './src/shared/hooks',
            '@/services': './src/shared/services',
            '@/types': './src/shared/types',
            '@/utils': './src/shared/utils',
            '@/theme': './src/shared/theme',
            '@/assets': './assets',
          },
        },
      ],
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
