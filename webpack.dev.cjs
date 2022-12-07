const { merge } = require('webpack-merge')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const common = require('./webpack.config.cjs')

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        liveReload: true,
        watchFiles: ['public/**/*', './src/style/**/*'],
        static: './src/dist'
    },
    plugins: [
        new BundleAnalyzerPlugin()
    ]
})