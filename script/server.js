/*eslint-disable*/

var path = require('path');
var express = require('express');
var webpack = require('webpack');
var devMiddleware = require('webpack-dev-middleware');
var hotMiddleware = require('webpack-hot-middleware');
var historyApiFallback = require('connect-history-api-fallback');
var portfinder = require('portfinder');
var clc = require('cli-color');
var webpackConfig = require('../webpack.config');
var dl = require('devlisten');

var banner = `
    -----------------------
    |      GUT LEBEN      |
    |---------------------|
    |         IN          |
    |---------------------|
    |     DEUTSCHLAND     |
    -----------------------
`;

function createExpressApp(config) {
  var app = express();
  var compiler = webpack(config);

  app.use(historyApiFallback());
  
  app.use(devMiddleware(compiler, {
      publicPath: config.output.publicPath,
      contentBase: config.output.contentBase,
      stats: {
        assets: false,
        chunkModules: false,
        chunkOrigins: false,
        chunks: false,
        colors: true,
        hash: false,
        timings: true,
        version: false
      }
    }));

  app.use(hotMiddleware(compiler, {log: false}));

  return app;
};

dl.devlisten('quality-of-life-in-germany', createExpressApp(webpackConfig), function(err, results) {
  if (err) { throw err };

  var urls = results
    .map(function(x) { return clc.underline(x); })
    .join(' and ');

  console.log(clc.erase.screen);
  console.log(clc.red(banner));
  console.log(clc.red('\nServer running at ' + urls) + '\n');
});
