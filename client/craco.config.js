module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  devServer: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
}