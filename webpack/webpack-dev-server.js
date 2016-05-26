var Express = require('express');
var webpack = require('webpack');
var path = require("path");

var envConfig = require('../src/config');

var webpackConfig = require('./dev.config');
var compiler = webpack(webpackConfig);

var host = envConfig.host || 'localhost';
var port = Number(envConfig.port) || 3000;
var serverOptions = {
  contentBase: path.resolve(__dirname, "../src"),
  quiet: false,
  noInfo: false,
  hot: true,
  inline: true,
  lazy: false,
  color: true,
  progress: true,
  publicPath: webpackConfig.output.publicPath,
  headers: { 'Access-Control-Allow-Origin': '*' },
  stats: { colors: true }
};

var app = new Express();

app.use(require('webpack-dev-middleware')(compiler, serverOptions));
app.use(require('webpack-hot-middleware')(compiler));
app.listen(port, function onAppListening(err) {
  if (err) {
    console.error(err);
  } else {
    console.info('==>   Webpack development server listening on port %s', port);
  }
});
