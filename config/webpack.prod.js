const { ROOT, path } = require('./webpack.constant');
const { merge } = require('webpack-merge');
const webpack = require('webpack');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const commonConfig = require('./webpack.common');

const prodConfig = {
  mode: 'production',
  output: {
    path: path.join(ROOT, '/build'),
    filename: 'sk-[name].[contenthash].min.js',
    clean: true,
  },
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.ENABLE_MOCK_SERVER': JSON.stringify(process.env.ENABLE_MOCK_SERVER || false),
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.STATS || 'disabled',
      generateStatsFile: true,
      statsOptions: { source: false },
      reportFilename: path.join(ROOT, '/reports/bundle-size.html'),
    }),
  ],
};

module.exports = merge(commonConfig, prodConfig);
