module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Conditionally apply pxtransform for Taro
    ...(process.env.TARO_ENV === 'weapp' || process.env.TARO_ENV === 'h5' ? {
      'postcss-pxtransform': {
        platform: process.env.TARO_ENV,
        designWidth: 750, // Or your project's design width
      },
    } : {})
  }
}
