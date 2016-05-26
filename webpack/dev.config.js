// Webpack config for development
require('babel-polyfill');
var envConfig = require('../src/config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var assetsPath = path.resolve(__dirname, '../static/dist');
var host = (envConfig.host || 'localhost');
var port = +envConfig.port || 3000;

module.exports = {
  devtool: 'inline-source-map',
  context: path.resolve(__dirname, '..'),
  entry: {
    'main': [
      // 'babel-polyfill',
      'webpack-hot-middleware/client?path=http://' + host + ':' + port + '/__webpack_hmr',
      path.resolve(__dirname, "../src/index.js")
    ]
  },
  output: {
    path: assetsPath,
    filename: '[name]-[hash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: '/'
  },
  module: {
    loaders: [
      // { test: /z-worker\.js/, loader: 'raw' },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel?' + require('./babelLoaderQuery')],
      }, // , 'eslint-loader'
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.less$/, exclude: /node_modules/, loader: 'style!css!autoprefixer?browsers=last 2 version!less?outputStyle=expanded' },
      { test: /\.css$/, loader: 'style!css!autoprefixer?browsers=last 2 version!' },
      { test: /\.scss$/, include: /src/, loader: 'style!css?modules&importLoaders=2&localIdentName=[local]___[hash:base64:5]!autoprefixer?browsers=last 2 version!sass?outputStyle=expanded' },// &sourceMap
      { test: /\.woff(\?\S*)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.woff2(\?\S*)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.ttf(\?\S*)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
      { test: /\.eot(\?\S*)?$/, loader: "file-loader?name=fonts/[name].[ext]&limit=10000&mimetype=application/vnd.ms-fontobject" },
      { test: /\.svg(\?\S*)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          //'image?{bypassOnDebug: true, progressive:true, \
          //    optimizationLevel: 3, pngquant:{quality: "65-80", speed: 4}}',
          // url-loader更好用，小于10KB的图片会自动转成dataUrl，
          // 否则则调用file-loader，参数直接传入
          'url?limit=10000&name=images/[name].[ext]' //[hash:8].[name].[ext]
        ]
      }
    ]
  },
  resolve: {
    modulesDirectories: [
      'src',
      'node_modules'
    ],
    alias: [
      'helpers',
      'reducers',
      'components',
      "buglyui",
      'containers',
      'styles',
      'images',
      'utils'
    ].reduce((acc, dir) => (acc[dir] = path.join(__dirname, `../src/${dir}`)) && acc, {}),
    extensions: ['', '.json', '.js', '.jsx']
  },
  plugins: [
    // hot reload
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
      // make fetch available
      fetch: 'exports?self.fetch!isomorphic-fetch',
    }),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: true,
      __DEVTOOLS__: false  // <-------- DISABLE redux-devtools HERE
    }),
    new HtmlWebpackPlugin({
      title: 'Bugly App',
      template: path.resolve(__dirname, "../src/index.html"),
      hash: true,
      filename: path.resolve(__dirname, "../static/dist/index.html"),
      inject: 'body'
    }),
  ],
  target: 'web', // Make web variables accessible to webpack, e.g. window
  stats: true, // Don't show stats in the console
  progress: true,
};
