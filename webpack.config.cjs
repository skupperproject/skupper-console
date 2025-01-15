const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

const ROOT = process.cwd();

const config = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
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
      'process.env.OBSERVER_URL': JSON.stringify(process.env.OBSERVER_URL || ''),
      'process.env.BRAND_APP_LOGO': JSON.stringify(process.env.BRAND_APP_LOGO || ''),
      'process.env.API_VERSION': JSON.stringify(process.env.API_VERSION || ''),
      'process.env.USE_MOCK_SERVER': JSON.stringify(process.env.USE_MOCK_SERVER),
      'process.env.MOCK_ITEM_COUNT': JSON.stringify(process.env.MOCK_ITEM_COUNT),
      'process.env.MOCK_RESPONSE_DELAY': JSON.stringify(process.env.MOCK_RESPONSE_DELAY)
    }),

    new HtmlWebpackPlugin({
      template: path.resolve(ROOT, 'index.html'),
      favicon: process.env.BRAND_FAVICON || path.resolve(ROOT, 'public', 'favicon.ico')
    })
  ]
};

if (process.env.NODE_ENV === 'production') {
  config.mode = 'production';
  config.devtool = 'source-map';

  config.infrastructureLogging = {
    debug: true
  };

  config.output = {
    path: path.join(ROOT, '/build'),
    filename: '[name].[contenthash].min.js',
    chunkFilename: 'js/[name].[chunkhash].min.js',
    publicPath: '/',
    clean: true
  };

  config.performance = {
    maxEntrypointSize: 614400,
    maxAssetSize: 1048576
  };

  config.plugins?.push(
    process.env.BRAND_APP_LOGO &&
      new CopyWebpackPlugin({
        patterns: [
          {
            from: process.env.BRAND_APP_LOGO,
            to: path.resolve(ROOT, 'build', path.basename(process.env.BRAND_APP_LOGO))
          }
        ]
      }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: 'css/[name].[chunkhash].min.css',
      ignoreOrder: true
    })
  );

  config.optimization = {
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
          compress: true,
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
  };

  config.module.rules.push({
    test: /\.css$/,
    use: [MiniCssExtractPlugin.loader, 'css-loader']
  });
}

module.exports = config;
