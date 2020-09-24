//webpack合并插件
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require("webpack");

module.exports = merge(common, {
  devtool: "inline-source-map",
  output: {
    chunkFilename: "[name].js", // 代码分割
  },
  mode: "development",
  plugins: [
    // 把样式单独打包成css文件
    new ExtractTextPlugin({
      filename: "[name].css",
      allChunks: true, //所有模块，包括node_modules
    }),
    new webpack.DefinePlugin({
      DEVELEPMENT: JSON.stringify(true),
      PRODUCTION: JSON.stringify(false),
      "process.env.NODE_ENV": JSON.stringify("develepment"),
    }),
  ],
  devServer: {
    contentBase: "./orcs-web",
    port: 3000,
    /*
     * 不加下面两行：浏览器运行网址：http://localhost:3000
     * 加下面两行：浏览器运行网址：http://10.95.18.76:3000(开启内网访问)
     */
    // host: "10.95.18.218",
    // disableHostCheck: true,
  },
});
