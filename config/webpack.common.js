const { ROOT, path } = require('./webpack.constant');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
    entry: path.join(ROOT, 'src/index.tsx'),
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        plugins: [new TsConfigPathsPlugin({ configFile: path.join(ROOT, 'tsconfig.json') })],
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
        new webpack.DefinePlugin({
            'process.env.API_HOST': JSON.stringify(process.env.API_HOST || ''),
        }),
        new HtmlWebpackPlugin({
            template: path.join(ROOT, '/public/index.html'),
        }),
    ],
};
