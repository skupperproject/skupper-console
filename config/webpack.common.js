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
            'process.env.API_HOST_FLOW_COLLECTOR': JSON.stringify(
                process.env.API_HOST_FLOW_COLLECTOR || '',
            ),
            'process.env.NODE_API_HOST': JSON.stringify(process.env.NODE_API_HOST || ''),
            'process.env.NODE_API_HOST_FLOW_COLLECTOR': JSON.stringify(
                process.env.NODE_API_HOST_FLOW_COLLECTOR || '',
            ),
        }),
        new HtmlWebpackPlugin({
            template: path.join(ROOT, '/public/index.html'),
        }),
    ],
};
