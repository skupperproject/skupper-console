const path = require('path');
const ROOT = process.cwd();

const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { version } = require(path.join(ROOT, '/package.json'));

module.exports = {
  entry: path.join(ROOT, 'src/index.tsx'),
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsConfigPathsPlugin({ configFile: path.join(ROOT, 'tsconfig.json') })]
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
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
      'process.env.APP_VERSION': JSON.stringify(process.env.APP_VERSION) || JSON.stringify(version),
      'process.env.COLLECTOR_URL': JSON.stringify(process.env.COLLECTOR_URL || ''),
      'process.env.MOCK_ITEM_COUNT': JSON.stringify(process.env.MOCK_ITEM_COUNT),
      'process.env.MOCK_DELAY_RESPONSE': JSON.stringify(process.env.MOCK_DELAY_RESPONSE)
    }),
    new HtmlWebpackPlugin({
      template: path.join(ROOT, '/public/index.html'),
      templateParameters: {
        title: process.env.BRAND_TITLE || 'Skupper console'
      }
    })
  ]
};
