//webpack合并插件
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = merge(common, {
    // devtool: 'source-map',
    output: {
        chunkFilename: '[name].[chunkhash:8].js', // 代码分割、hash8位值
    },
    mode: 'production',
    plugins: [
        new UglifyJSPlugin({
            sourceMap: true
        }),
        //去除log、test、warning，引用第三方生产包
        new webpack.DefinePlugin({
            DEVELEPMENT: JSON.stringify(false),
            PRODUCTION: JSON.stringify(true),
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new CleanWebpackPlugin(),
        // 通过模块调用次数给模块分配ids，常用的ids就会分配更短的id，使ids可预测，减小文件大小
        new webpack.optimize.OccurrenceOrderPlugin(true),
        new ExtractTextPlugin({
            filename: "[name]-[chunkhash:8].css",
            allChunks: true
        })
    ]
});