const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const dev = false;

let mode = 'development';
let optimization = { }

if (!dev) {
  mode = 'production';
  optimization = {
    minimize: true,
    minimizer: [new TerserPlugin()],
  }
}

module.exports = {
  entry: './built/Initializer/Initializer.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  mode,
  watch: true,
  optimization
}