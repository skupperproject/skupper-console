const pathProd = require('path'); // Path module to handle file system paths
const ROOT_PROD = process.cwd(); // Root directory of the project

// Import necessary Webpack plugins and utilities
const { merge: mergeProd } = require('webpack-merge'); // Merge production config with common config
const webpackProd = require('webpack'); // Webpack core library
const CopyWebpackPlugin = require('copy-webpack-plugin'); // Plugin to copy assets like favicon
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // Extract CSS into separate files
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin'); // Minify CSS files
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // Analyze the bundle size
const TerserJSPlugin = require('terser-webpack-plugin'); // Minify JavaScript files

const commonConfigProd = require('./webpack.common'); // Common Webpack configuration

// Webpack production-specific configuration
const prodConfig = {
  mode: 'production', // Set mode to 'production' for optimizations like minification
  devtool: 'source-map', // Generate source maps for debugging
  infrastructureLogging: {
    debug: true // Enable debugging for Webpack infrastructure
  },
  output: {
    path: pathProd.join(ROOT_PROD, '/build'), // Output directory for production build
    filename: '[name]-[contenthash].min.js', // Use content hash in filenames for cache busting
    chunkFilename: 'js/[name]-[chunkhash].min.js', // Chunk filenames with a hash
    publicPath: '/', // Public URL of the output directory
    clean: true // Clean the output directory before each build
  },
  performance: {
    maxEntrypointSize: 512000, // Limit entry point size to 500 KB
    maxAssetSize: 512000 // Limit asset size to 500 KB
  },

  plugins: [
    new webpackProd.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'), // Define environment variable
      'process.env.ENABLE_MOCK_SERVER': JSON.stringify(process.env.ENABLE_MOCK_SERVER || false) // Mock server flag
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.STATS || 'disabled', // Control bundle analyzer behavior via environment variable
      generateStatsFile: false, // Do not generate a stats file
      statsOptions: { source: false }, // Disable source code in stats file
      reportFilename: pathProd.join(ROOT_PROD, '/reports/bundle-size.html') // Path for the bundle analysis report
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: process.env.BRAND_FAVICON || pathProd.resolve(ROOT_PROD, 'public', 'favicon.ico'), // Copy favicon to build directory
          to: pathProd.resolve(ROOT_PROD, 'build', 'favicon.v.ico') // Destination path for the favicon
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css', // Extracted CSS filenames with content hash
      chunkFilename: 'css/[name].[chunkhash].min.css', // Chunk CSS files with chunk hash
      ignoreOrder: true // Ignore CSS order warnings
    })
  ],

  optimization: {
    chunkIds: 'named', // Use named chunk IDs for easier debugging
    minimize: true, // Enable minimization for JS and CSS
    splitChunks: {
      chunks: 'all', // Split all chunks, including from node_modules
      maxInitialRequests: 6, // Limit initial chunk requests to 6
      maxAsyncRequests: 8, // Limit async chunk requests to 8
      cacheGroups: {
        vendors: {
          test: /\/node_modules\//, // Group all node_modules into a 'vendors' cache group
          priority: -10, // Set lower priority for vendor cache group
          enforce: true // Force vendor grouping
        }
      }
    },
    runtimeChunk: 'single', // Extract Webpack runtime into a separate chunk
    minimizer: [
      new TerserJSPlugin({
        test: /\.js$/, // Apply TerserJS for minifying JavaScript
        terserOptions: {
          compress: false, // Do not apply compression (optional)
          mangle: true, // Mangle variable names to reduce file size
          format: {
            comments: false // Remove comments from the minified code
          }
        },
        extractComments: false // Do not extract comments into a separate file
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ['default', { mergeLonghand: false }] // Minify CSS with specific options
        }
      })
    ]
  },

  module: {
    rules: [
      {
        test: /\.css$/, // Rule for handling CSS files
        use: [MiniCssExtractPlugin.loader, 'css-loader'] // Extract and load CSS files
      }
    ]
  }
};

// Merge common configuration with production-specific configuration
module.exports = mergeProd(commonConfigProd, prodConfig);
