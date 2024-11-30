const { merge: mergeDev } = require('webpack-merge');
const commonConfigDev = require('./webpack.common');

const devConfig = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  devServer: {
    port: 3000,
    historyApiFallback: true,
    compress: true
  },

  module: {
    rules: [
      {
        test: /\.css/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};

module.exports = mergeDev(commonConfigDev, devConfig);
