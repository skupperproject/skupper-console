import path from 'path';
import fs from 'fs';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserJSPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import CircularDependencyPlugin from 'circular-dependency-plugin';

const ROOT = process.cwd();

/** Helper for defining environment variables */
const defineEnvVariables = () =>
  new webpack.DefinePlugin({
    'process.env.OBSERVER_URL': JSON.stringify(process.env.OBSERVER_URL || ''),
    'process.env.BRAND_APP_LOGO': JSON.stringify(process.env.BRAND_APP_LOGO || ''),
    'process.env.API_VERSION': JSON.stringify(process.env.API_VERSION || ''),
    'process.env.USE_MOCK_SERVER': JSON.stringify(process.env.USE_MOCK_SERVER || ''),
    'process.env.MOCK_ITEM_COUNT': JSON.stringify(process.env.MOCK_ITEM_COUNT || ''),
    'process.env.MOCK_RESPONSE_DELAY': JSON.stringify(process.env.MOCK_RESPONSE_DELAY || '')
  });

/** Module rules configuration */
const moduleRules = [
  {
    test: /\.tsx?$/,
    loader: 'ts-loader',
    include: [path.resolve(ROOT, 'src'), path.resolve(ROOT, 'mocks')],
    options: { transpileOnly: true, happyPackMode: true }
  },
  {
    test: /\.(svg|jpg|jpeg|png)$/i,
    type: 'asset/resource',
    generator: { filename: 'assets/[name].[contenthash][ext]' }
  },
  {
    test: /\.(woff|woff2|eot|ttf|otf)$/i,
    type: 'asset/resource',
    generator: { filename: 'fonts/[name][ext]' }
  },
  {
    test: /\.css$/,
    use: [MiniCssExtractPlugin.loader, 'css-loader']
  }
];

/** Optimization configuration */
const optimizationConfig = {
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
        format: { comments: false }
      },
      extractComments: false
    })
  ]
};

/** Plugins configuration */
const pluginsConfig = () => [
  defineEnvVariables(),
  new HtmlWebpackPlugin({
    template: path.resolve(ROOT, 'index.html'),
    favicon: process.env.BRAND_FAVICON || path.resolve(ROOT, 'public', 'favicon.ico'),
    templateContent: (parameters, compilation, options) => {
      const html = fs.readFileSync(path.resolve(ROOT, 'index.html'), 'utf8');
      return html.replace(/<!-- vite only -->[\s\S]*?<\/script>/, ''); // remove the script tag used by vite in dev mode
    }
  }),
  ...(process.env.BRAND_APP_LOGO
    ? [
        new CopyWebpackPlugin({
          patterns: [
            {
              from: process.env.BRAND_APP_LOGO,
              to: path.resolve(ROOT, 'build', path.basename(process.env.BRAND_APP_LOGO))
            }
          ]
        })
      ]
    : []),
  new MiniCssExtractPlugin({
    filename: '[name].[contenthash].css',
    chunkFilename: 'css/[name].[chunkhash].min.css',
    ignoreOrder: true
  }),
  new CircularDependencyPlugin({
    include: /src/,
    exclude: /node_modules/,
    failOnError: true
  })
];

/** Webpack configuration object */
const config = {
  mode: 'production',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: moduleRules
  },
  plugins: pluginsConfig(),
  output: {
    path: path.join(ROOT, '/build'),
    filename: '[name].[contenthash].min.js',
    chunkFilename: 'js/[name].[chunkhash].min.js',
    publicPath: '/',
    clean: true
  },
  optimization: optimizationConfig,
  performance: {
    maxEntrypointSize: 614400,
    maxAssetSize: 1048576
  },
  infrastructureLogging: {
    debug: true
  }
};

export default config;
