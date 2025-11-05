const path = require('path');

module.exports = {
  devServer: {
    port: 5000,
    open: false,
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};
