const { merge } = require('webpack-merge');

const CircularDependencyPlugin = require('circular-dependency-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const commonConfig = require('./webpack.common');

const MAX_CYCLES = 5;
let numCyclesDetected = 0;

const devConfig = {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    port: 3000,
    historyApiFallback: true,
    compress: true
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
      allowAsyncCycles: false,
      cwd: process.cwd(),
      onStart({ _ }) {
        numCyclesDetected = 0;
      },
      onDetected({ module: _, paths, compilation }) {
        numCyclesDetected++;
        compilation.warnings.push(new Error(paths.join(' -> ')));
      },
      onEnd({ compilation }) {
        if (numCyclesDetected > MAX_CYCLES) {
          compilation.errors.push(
            new Error(`Detected ${numCyclesDetected} cycles which exceeds configured limit of ${MAX_CYCLES}`)
          );
        }
      }
    })
  ],

  module: {
    rules: [
      {
        test: /\.css/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};

module.exports = merge(commonConfig, devConfig);
