const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ROOT = process.cwd(); // Root directory of the project

module.exports = {
  entry: path.join(ROOT, 'src/index.tsx'), // Entry point for the application (main TypeScript file)
  resolve: {
    extensions: ['.ts', '.tsx', '.js'] // Resolve file extensions for TypeScript and JavaScript
  },

  cache: {
    cacheDirectory: path.resolve(__dirname, '.webpack-cache'), // Directory to store Webpack cache
    type: 'filesystem' // Enable filesystem caching to improve build performance
  },

  output: {
    pathinfo: false // Disable output path information to reduce build log noise
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/, // Apply ts-loader for TypeScript files (.ts, .tsx)
        loader: 'ts-loader',
        include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'mocks')], // Include source and mocks directories
        options: {
          transpileOnly: true, // Only transpile, don't type-check
          happyPackMode: true // Enable HappyPack mode for faster builds
        }
      },
      {
        test: /\.(svg|jpg|jpeg|png)$/i, // Handle image assets (SVG, JPG, PNG)
        type: 'asset/resource', // Treat them as resources and copy to the output folder
        generator: {
          filename: 'assets/[name].[contenthash][ext]' // Use content hash for cache busting
        }
      },
      {
        test: /\.(png)$/i, // Handle PNG files separately (similar to above)
        type: 'asset/resource',
        generator: {
          filename: '[name].[contenthash][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i, // Handle font files (woff, woff2, eot, ttf, otf)
        type: 'asset/resource', // Treat them as resources and copy to the output folder
        generator: {
          filename: 'fonts/[name][ext]' // Save fonts in the 'fonts' directory
        }
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      // Define environment variables for use in the application
      'process.env.BRAND_APP_LOGO': JSON.stringify(process.env.BRAND_APP_LOGO || ''),
      'process.env.COLLECTOR_URL': JSON.stringify(process.env.COLLECTOR_URL || ''),
      'process.env.API_VERSION': JSON.stringify(process.env.API_VERSION || ''),
      'process.env.MOCK_ITEM_COUNT': JSON.stringify(process.env.MOCK_ITEM_COUNT),
      'process.env.MOCK_DELAY_RESPONSE': JSON.stringify(process.env.MOCK_DELAY_RESPONSE)
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(ROOT, 'public', 'index.html') // Generate HTML from a template
    })
  ]
};
