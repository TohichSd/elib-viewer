const path = require('path')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const HtmlWebpackPlugin = require('html-webpack-plugin')

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
        path: path.resolve(__dirname, 'public', 'dist'),
        filename: '[name].bundle.js',
        clean: true
    },
    optimization: {
        runtimeChunk: 'single',
        concatenateModules: true,
        minimize: true,
        splitChunks: {
            maxSize: 244*1024,
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            filename: 'vendor~[name].bundle.js',
            cacheGroups: {
                default: {
                    minChunks: 2,
                    reuseExistingChunk: true,
                },
                reactVendor: {
                    test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
                    chunks: 'all',
                }
            }
        }
    },
    plugins: [
        new NodePolyfillPlugin(),
        // new BundleAnalyzerPlugin(),
        new HtmlWebpackPlugin({
            title: 'Elib Viewer',
            filename: path.resolve(__dirname, 'public', 'index.html'),
        })
    ]
}