const path = require('path')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
    entry: {
        index: './src/index.tsx'
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
            { test: /\.styl$/, use: ['style-loader', 'css-loader', 'stylus-loader'] },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            { test: /\.svg$/i, issuer: /\.[jt]sx?$/, use: ['@svgr/webpack'] }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    output: {
        path: path.resolve(__dirname, 'public/dist'),
        filename: '[name].bundle.js'
    },
    optimization: {
        chunkIds: 'natural',
        splitChunks: {
            chunks: 'all',
        }
    },
    plugins: [
        new NodePolyfillPlugin()
    ]
}