module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@/components': './src/components',
          '@/context': './src/context',
          '@/screens': './src/screens',
          '@/service': './src/service',
          '@/store': './src/store',
          '@/theme': './src/themme',
          '@/types': './src/types'
        }
      }
    ]
  ]
};
