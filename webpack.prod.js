const path = require('path');
const ROOT = process.cwd();

const { merge } = require('webpack-merge');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserJSPlugin = require('terser-webpack-plugin');

const commonConfig = require('./webpack.common');

const prodConfig = {
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: path.join(ROOT, '/build'),
    filename: '[name]-[contenthash].js',
    chunkFilename: 'js/[name]-[contenthash].bundle.js',
    publicPath: '/',
    clean: true
  },
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.ENABLE_MOCK_SERVER': JSON.stringify(process.env.ENABLE_MOCK_SERVER || false)
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.STATS || 'disabled',
      generateStatsFile: false,
      statsOptions: { source: false },
      reportFilename: path.join(ROOT, '/reports/bundle-size.html')
    }),
    new CopyWebpackPlugin({
      patterns: [
        path.resolve(ROOT, 'public', 'manifest.json'),
        {
          from: process.env.BRAND_FAVICON_PATH || path.resolve(ROOT, 'public', 'favicon.v.ico'),
          to: path.resolve(__dirname, 'build', 'favicon.v.ico')
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: 'css/[name].[contenthash].bundle.css',
      ignoreOrder: true
    })
  ],

  optimization: {
    chunkIds: 'named',
    minimizer: [
      new TerserJSPlugin({}),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ['default', { mergeLonghand: false }]
        }
      })
    ]
  },

  module: {
    rules: [
      {
        test: /\.css/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  }
};

module.exports = merge(commonConfig, prodConfig);
