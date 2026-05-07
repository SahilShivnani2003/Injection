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
          '@/navigation': './src/navigation', 
          '@/screens': './src/screens',
          '@/service': './src/service',
          '@/store': './src/store',
          '@/theme': './src/theme', 
          '@/types': './src/types',
          '@/assets': './src/assets',
          '@/features': './src/features'
        }
      }
    ]
  ]
};