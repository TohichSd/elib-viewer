const path = require('path')

module.exports = {
    entry: {
        index: './src/index.tsx'
    },
    mode: 'development',
    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
            { test: /\.styl$/, use: ['style-loader', 'css-loader', 'stylus-loader'] }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    devServer: {
        liveReload: true,
        watchFiles: ['public/**/*', './src/style/**/*']
    },
    devtool: 'inline-source-map'
}