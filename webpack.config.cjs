const path = require('path')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

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
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
        clean: true
    },
    plugins: [
        new NodePolyfillPlugin(),
        new HtmlWebpackPlugin({
            title: 'ELib Viewer',
            filename: path.resolve(__dirname, 'dist', 'index.html'),
            template: path.resolve(__dirname, 'src/static/views/index.ejs')
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/static/assets/favicon'),
                    to: path.resolve(__dirname, 'dist')
                },
                {
                    from: path.resolve(__dirname, 'src/static/browser-config'),
                    to: path.resolve(__dirname, 'dist')
                }
            ]
            
        })
    ]
}