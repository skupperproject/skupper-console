const pathProd = require('path');
const ROOT_PROD = process.cwd();

const { merge: mergeProd } = require('webpack-merge');
const webpackProd = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserJSPlugin = require('terser-webpack-plugin');

const commonConfigProd = require('./webpack.common');

const prodConfig = {
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: pathProd.join(ROOT_PROD, '/build'),
    filename: '[name]-[contenthash].min.js',
    chunkFilename: 'js/[name]-[chunkhash].min.js',
    publicPath: '/',
    clean: true
  },
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },

  plugins: [
    new webpackProd.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.ENABLE_MOCK_SERVER': JSON.stringify(process.env.ENABLE_MOCK_SERVER || false)
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.STATS || 'disabled',
      generateStatsFile: false,
      statsOptions: { source: false },
      reportFilename: pathProd.join(ROOT_PROD, '/reports/bundle-size.html')
    }),
    new CopyWebpackPlugin({
      patterns: [
        pathProd.resolve(ROOT_PROD, 'public', 'manifest.json'),
        {
          from: process.env.BRAND_FAVICON || pathProd.resolve(ROOT_PROD, 'public', 'favicon.ico'),
          to: pathProd.resolve(ROOT_PROD, 'build', 'favicon.v.ico')
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: 'css/[name].[chunkhash].min.css',
      ignoreOrder: true
    })
  ],

  optimization: {
    chunkIds: 'named',
    minimize: true,
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 6,
      maxAsyncRequests: 8,
      cacheGroups: {
        vendors: {
          test: /\/node_modules\//,
          priority: -10,
          enforce: true
        }
      }
    },
    runtimeChunk: 'single',
    minimizer: [
      new TerserJSPlugin({
        test: /\.js$/,
        terserOptions: {
          compress: false,
          mangle: true,
          format: {
            comments: false
          }
        },
        extractComments: false
      }),
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

module.exports = mergeProd(commonConfigProd, prodConfig);
