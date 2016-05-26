require('babel-polyfill');

// Webpack config for creating the production bundle.
var path = require('path');
var fs = require("fs");
var webpack = require('webpack');
var CleanPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var strip = require('strip-loader');

var projectRootPath = path.resolve(__dirname, '../');
var assetsPath = path.resolve(projectRootPath, './static/dist');

module.exports = {
  devtool: 'source-map',
  context: path.resolve(__dirname, '..'),
  entry: {
    'main': [
      path.resolve(__dirname, "../src/index.js")
    ]
  },
  output: {
    path: assetsPath,
    filename: '[name]-[chunkhash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: '/'
  },
  module: {
    loaders: [
      // { test: /z-worker\.js/, loader: 'raw' },
      { test: /\.jsx?$/, exclude: /node_modules/, loaders: [strip.loader('debug'), 'babel?' + require('./babelLoaderQuery')] },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.less$/, loader: ExtractTextPlugin.extract('style', 'css?sourceMap!autoprefixer?browsers=last 2 version!less?outputStyle=expanded') },
      { test: /\.scss$/, loader: ExtractTextPlugin.extract('style', 'css?modules&importLoaders=2&sourceMap!autoprefixer?browsers=last 2 version!sass?outputStyle=expanded&sourceMap=true&sourceMapContents=true') },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css?sourceMap!autoprefixer?browsers=last 2 version') },
      { test: /\.woff(\?\S*)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.woff2(\?\S*)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.ttf(\?\S*)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
      { test: /\.eot(\?\S*)?$/, loader: "file-loader?limit=10000&mimetype=application/vnd.ms-fontobject" },
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
    new CleanPlugin([assetsPath], { root: projectRootPath }),

    // css files from the extract-text-plugin loader
    new ExtractTextPlugin('[name]-[chunkhash].css', { allChunks: true }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      },

      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: false,
      __DEVTOOLS__: false
    }),

    // ignore dev config
    new webpack.IgnorePlugin(/\.\/dev/, /\/config$/),

    // optimizations
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new HtmlWebpackPlugin({
      title: 'Bugly App',
      template: path.resolve(__dirname, "../src/index.html"),
      hash: true,
      filename: path.resolve(__dirname, "../static/dist/index.html"),
      inject: 'body'
    }),
  ],
  progress: true,
};
