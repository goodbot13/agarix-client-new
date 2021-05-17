const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './built/Initializer/Initializer.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  mode: "production", // development | production
  watch: true,
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
}