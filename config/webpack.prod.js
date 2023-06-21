const { ROOT, path } = require('./webpack.constant');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const commonConfig = require('./webpack.common');

const prodConfig = {
  mode: 'production',
  output: {
    path: path.join(ROOT, '/build'),
    filename: 'sk-[name].[contenthash].min.js',
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
        process.env.BRAND_FAVICON_PATH || path.resolve(ROOT, 'public', 'favicon.ico')
      ]
    })
  ]
};

module.exports = merge(commonConfig, prodConfig);
