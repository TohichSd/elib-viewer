const { merge } = require('webpack-merge')
const common = require('./webpack.config.cjs')

module.exports = merge(common, {
    mode: 'production',
    devtool: false,
    optimization: {
        concatenateModules: true,
        minimize: true,
        splitChunks: {
            maxSize: 244 * 1024,
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            filename: 'vendor~[name].bundle.js',
            cacheGroups: {
                default: {
                    minChunks: 2,
                    reuseExistingChunk: true
                },
                reactVendor: {
                    test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
                    chunks: 'all'
                }
            }
        }
    }
})