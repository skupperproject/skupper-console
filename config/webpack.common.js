const { ROOT, path } = require('./webpack.constant');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.join(ROOT, 'src/index.tsx'),
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@assets': path.join(ROOT, 'src/assets'),
      '@layout': path.join(ROOT, 'src/layout'),
      '@models': path.join(ROOT, 'src/models'),
      '@pages': path.join(ROOT, 'src/pages'),
      '@routes': path.join(ROOT, 'src/routes'),
    },
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
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(ROOT, '/public/index.html'),
    }),
  ],
};
