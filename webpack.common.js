//导入Node.js的path模块,主要用来转换成绝对路径,比如path.resolve(__dirname, 'build')
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        backWeb: ['babel-polyfill', './src/js/backWeb.js'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'orcs-web'),
    },
    plugins: [
        // 配置全局变量
        new webpack.ProvidePlugin({
            React: 'react',
            ReactDOM: 'react-dom',
        }),
        // PC端后台入口
        new HtmlWebpackPlugin({
            title: '运行风险管控系统',
            filename: './index.html',
            template: './src/js/backWeb.html',
            favicon: './favicon.ico', // 添加小图标
            chunksSortMode: 'manual',//按照顺序引入js
            chunks: ['manifest', 'thirdParty', 'backWeb', 'common']
        }),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'src/json'),
                to: path.resolve(__dirname, 'orcs-web/json')
            }
        ]),
    ],
    resolve: {
        // 配置路径别名
        alias: {
            common: path.resolve(__dirname, 'src/js/common'),
            service: path.resolve(__dirname, 'src/js/service'),
            json: path.resolve(__dirname, 'src/json'),
            css: path.resolve(__dirname, 'src/css'),
            model: path.resolve(__dirname, 'src/js/model'),
            images: path.resolve(__dirname, 'src/images'),
            pages: path.resolve(__dirname, 'src/js/pages'),
            reduxs: path.resolve(__dirname, 'src/js/reduxs'),
        }
    },
    optimization: {
        // 抽离webpack运行文件
        runtimeChunk: {
            name: 'manifest'
        },
        splitChunks: {
            //抽取模式
            chunks: 'all',
            //最小提取体积
            minSize: 30000,
            //引用次数
            minChunks: 1,
            //按需加载时候最大的并行请求数
            maxAsyncRequests: 5,
            //一个入口最大的并行请求数
            maxInitialRequests: 3,
            //命名连接符
            automaticNameDelimiter: '-',
            // name: 'thirdParty',
            cacheGroups: {
                thirdParty: {  // 抽离第三方插件
                    test: /[\\/]node_modules[\\/]/,     // 指定是node_modules下的第三方包
                    name: "thirdParty",
                    priority: -10                       // 抽取优先级
                },
                utilCommon: {   // 抽离自定义工具库
                    name: "common",
                    minSize: 0,     // 将引用模块分离成新代码文件的最小体积
                    minChunks: 2,   // 表示将引用模块如不同文件引用了多少次，才能分离生成新chunk
                    priority: -20
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader',
                    }, 
                    {
                        loader: 'css-loader', // translates CSS into CommonJS
                    }, 
                    {
                        loader: require.resolve('less-loader'),
                        options: {
                            javascriptEnabled: true,
                            modifyVars: {
                                '@light': '#fff',
                                '@dark': '#000',
                                '@heading-color': 'fade(@light, 85)',
                                '@text-color': 'fade(@light, 65)',
                                '@text-color-secondary': 'fade(@light, 45)',
                                '@disabled-color': 'fade(@light, 25)',
                                '@primary-5': '#40a9ff',
                                '@primary-color': '#1890ff',
                                '@outline-color': '@primary-color',
                                '@icon-color': 'fade(@light, 65)',
                                '@icon-color-hover': 'fade(@light, 85)',
                                '@primary-6': '#096dd9',
                                '@border-color-base': '@border-color-split',
                                '@btn-default-color': '@heading-color',
                                '@btn-default-bg': '#444457',
                                '@btn-default-border': '#444457',
                                '@btn-ghost-color': 'fade(@light, 45)',
                                '@btn-ghost-border': 'fade(@light, 45)',
                                '@input-color': '@text-color',
                                '@input-bg': '#3b3b4d',
                                '@input-disabled-bg': '#4c4c61',
                                '@input-placeholder-color': '@text-color-secondary',
                                '@input-hover-border-color': 'fade(@light, 10)',
                                '@checkbox-check-color': '#3b3b4d',
                                '@checkbox-color': '@primary-color',
                                '@select-border-color': '#3b3b4d',
                                '@item-active-bg': '#272733',
                                '@border-color-split': '#17171f',
                                '@menu-dark-bg': '#001529',
                                '@body-background': '#30303d',
                                '@component-background': '#23232e',
                                '@layout-body-background': '@body-background',
                                '@tooltip-bg': '#191922',
                                '@tooltip-arrow-color': '#191922',
                                '@popover-bg': '#2d2d3b',
                                '@success-color': '#00a854',
                                '@info-color': '@primary-color',
                                '@warning-color': '#ffbf00',
                                '@error-color': '#f04134',
                                '@menu-bg': '#30303d',
                                '@menu-item-active-bg': 'fade(@light, 5)',
                                '@menu-highlight-color': '@light',
                                '@card-background': '@component-background',
                                '@card-hover-border': '#383847',
                                '@card-actions-background': '#30303d',
                                '@tail-color': 'fade(@light, 10)',
                                '@radio-button-bg': 'transparent',
                                '@radio-button-checked-bg': 'transparent',
                                '@radio-dot-color': '@primary-color',
                                '@table-row-hover-bg': '#383847',
                                '@item-hover-bg': '#383847',
                                '@alert-text-color': 'fade(@dark, 65%)',
                                '@tabs-horizontal-padding': '12px 0',
                                // zIndex': 'notification > popover > tooltip
                                '@zindex-notification': '1063',
                                '@zindex-popover': '1061',
                                '@zindex-tooltip': '1060',
                                // width
                                '@anchor-border-width': '1px',
                                // margin
                                '@form-item-margin-bottom': '24px',
                                '@menu-item-vertical-margin': '0px',
                                '@menu-item-boundary-margin': '0px',
                                // size
                                '@font-size-base': '14px',
                                '@font-size-lg': '16px',
                                '@screen-xl': '1208px',
                                '@screen-lg': '1024px',
                                '@screen-md': '768px',
                                // 移动
                                '@screen-sm': '767.9px',
                                // 超小屏
                                '@screen-xs': '375px',
                                '@alert-message-color': '@popover-bg',
                                '@background-color-light': '@popover-bg',
                                '@layout-header-background': '@menu-dark-bg',
                                // 官网
                                '@site-text-color': '@text-color',
                                '@site-border-color-split': 'fade(@light, 5)',
                                '@site-heading-color': '@heading-color',
                                '@site-header-box-shadow': '0 0.3px 0.9px rgba(0, 0, 0, 0.12), 0 1.6px 3.6px rgba(0, 0, 0, 0.12)',
                                '@home-text-color': '@text-color',
                                //自定义需要找设计师
                                '@gray-8': '@text-color',
                                '@background-color-base': '#555',
                                '@skeleton-color': 'rgba(0,0,0,0.8)',
                                // pro
                                '@pro-header-box-shadow': '@site-header-box-shadow',
                            }
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: {
                        loader: "style-loader"
                    },
                    use: [
                        {
                            loader: "css-loader",
                        },
                        {
                            loader: "sass-loader"
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                plugins: [
                                    require("autoprefixer") /*增加css3样式前缀*/
                                ]
                            }
                        }
                    ]
                })
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192
                        }
                    }
                ]
            },
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/, //忽略mode_modules的代码  
                query: {
                    presets: ['es2015', 'react'], //解析es6和react语言 
                    env: {
                        "production": {
                            //去除prop-types属性校验
                            "plugins": ["react-remove-prop-types"]
                        }
                    },
                    plugins: [
                        // 懒加载antd和antd-mobile的css
                        ["import", { "libraryName": "antd", "libraryDirectory": 'es', "style": true }],// 自动加载对应 less 文件
                        //["import", { "libraryName": "antd-mobile", "libraryDirectory": 'es', "style": "css" }],// 自动加载对应 less 文件
                        ["transform-class-properties",
                            ["transform-async-to-module-method", {
                                "module": "bluebird",
                                "method": "coroutine"
                            }]]
                    ]
                },
            }
        ]
    }
};
