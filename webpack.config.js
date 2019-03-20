const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        'function-file': './functions/function-file.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                use: 'html-loader'
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                use: 'file-loader'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        new HtmlWebpackPlugin({
            template: './functions/function-file.html',
            filename: 'functions/function-file.html',
            chunks: ['function-file']
        })
    ]
};