import path from 'path';

import CircularDependencyPlugin from 'circular-dependency-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { DefinePlugin, Configuration as WebpackConfiguration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const webpackConfig = (): Configuration => {
  return {
    entry: path.join(__dirname, 'src/index.tsx'),
    ...(process.env.production || !process.env.development ? {} : { devtool: 'eval-source-map' }),

    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
      alias: {
        '@assets': path.join(__dirname, 'src/assets'),
        '@layout': path.join(__dirname, 'src/layout'),
        '@models': path.join(__dirname, 'src/models'),
        '@pages': path.join(__dirname, 'src/pages'),
        '@routes': path.join(__dirname, 'src/routes'),
      },
    },
    output: {
      path: path.join(__dirname, '/build'),
      filename: 'build.js',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
          exclude: /build/,
        },
        {
          test: /\.s?css$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
          type: 'asset/resource',
        },
      ],
    },
    devServer: {
      port: 1234,
      open: true,
      historyApiFallback: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '/public/index.html'),
      }),
      new DefinePlugin({
        'process.env': process.env.production || !process.env.development,
      }),
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
};

export default webpackConfig;
