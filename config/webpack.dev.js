const { ROOT, path } = require('./webpack.constant');
const { merge } = require('webpack-merge');

const CircularDependencyPlugin = require('circular-dependency-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const commonConfig = require('./webpack.common');

const devConfig = {
  mode: 'development',
  devServer: {
    port: 8081,
    open: true,
    historyApiFallback: true,
  },
  resolve: {
    plugins: [new TsConfigPathsPlugin({ configFile: path.join(ROOT, 'tsconfig.json') })],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new CircularDependencyPlugin({
      exclude: /a\.js|node_modules/,
      include: /dir/,
      failOnError: true,
      allowAsyncCycles: false,
      cwd: process.cwd(),
    }),
  ],
};

module.exports = merge(commonConfig, devConfig);
