const { merge: mergeDev } = require('webpack-merge');
const commonConfigDev = require('./webpack.common');
const pathDev = require('path');

const devConfig = {
  mode: 'development',
  devtool: 'cheap-module-source-map',

  devServer: {
    port: 3000,
    static: false
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
