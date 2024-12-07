const path = require('path');
const ROOT = process.cwd();

const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { version } = require(path.join(ROOT, '/package.json'));

module.exports = {
  entry: path.join(ROOT, 'src/index.tsx'),
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },

  cache: {
    cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
    type: 'filesystem'
  },

  output: {
    pathinfo: false
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'mocks')],
        options: {
          transpileOnly: true,
          happyPackMode: true
        }
      },
      {
        test: /\.(svg|jpg|jpeg|png)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name].[contenthash][ext]'
        }
      },
      {
        test: /\.(png)$/i,
        type: 'asset/resource',
        exclude: /assets/,
        generator: {
          filename: '[name].[contenthash][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        }
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.BRAND_APP_LOGO': JSON.stringify(process.env.BRAND_APP_LOGO || ''),
      'process.env.COLLECTOR_URL': JSON.stringify(process.env.COLLECTOR_URL || ''),
      'process.env.MOCK_ITEM_COUNT': JSON.stringify(process.env.MOCK_ITEM_COUNT),
      'process.env.MOCK_DELAY_RESPONSE': JSON.stringify(process.env.MOCK_DELAY_RESPONSE)
    }),
    new HtmlWebpackPlugin({
      template: path.join(ROOT, '/public/index.html')
    })
  ]
};
