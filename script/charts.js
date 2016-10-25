/*eslint-disable*/

var express = require('express');
var webpack = require('webpack');
var devMiddleware = require('webpack-dev-middleware');
var historyApiFallback = require('connect-history-api-fallback');
var webpackConfig = require('../webpack.config');
var dl = require('devlisten');
var getPort = require('portfinder').getPort;
var createServer = require('http').createServer;
var fs = require('fs');
var csvParse = require('d3-dsv').csvParse;
var csvFormat = require('d3-dsv').csvFormat;
var resolveRoot = require('path').resolve.bind(null, __dirname, '..');
var argv = require('minimist')(process.argv.slice(2));

var LABEL_SHEET_PATH = resolveRoot('content/charts-labels-translations.csv');

var app = express();

app.use(historyApiFallback());

var compiler = webpack(webpackConfig);
var webpackMiddleware = devMiddleware(compiler, {
  noInfo: true,
  publicPath: webpackConfig.output.publicPath,
  contentBase: webpackConfig.output.contentBase,
  stats: {
    assets: true,
    chunkModules: false,
    chunkOrigins: false,
    chunks: false,
    colors: true,
    hash: false,
    timings: true,
    version: false
  }
});
app.use(webpackMiddleware);

var host = '0.0.0.0';
getPort({port: 8090, host: host}, function(err, port) {
  if (err) { throw err; }

  var server = createServer(app);
  server.listen(port, host, () => {
    console.log(`[server] listening on ${port}`);
    webpackMiddleware.waitUntilValid(() => {
      console.log('[webpack] ready');
      var phantomjs = require('phantomjs-prebuilt');
      var charts = csvParse(fs.readFileSync(resolveRoot('content/charts.de.csv'), 'utf8'))
        // .concat({id: 'overview', status: 'plotted'}) // special inline charts to get labels of
        .filter(chart => argv.id ? chart.id.startsWith(argv.id) : true)
        .filter(chart => argv.type ? chart.type.indexOf(argv.type) !== -1 : true)
        .filter(chart => {
          if (!chart.status.match(/plotted/) && chart.id !== argv.id) {
            console.warn(`[${chart.id}] Skipping status «${chart.status}»`);
            return false;
          }
          return true;
        });

      var labels = [];
      var labelUsers = {};
      var afterJob = (job) => {
        if (job.locale === 'de') {
          var labelsFromJob = JSON.parse(fs.readFileSync(resolveRoot('assets/labels.json.tmp'), 'utf8'));
          labelsFromJob.forEach(label => {
            if (!labelUsers[label]) {
              labelUsers[label] = new Set();
            }
            labelUsers[label].add(job.id);
          });

          labels = labels.concat(labelsFromJob);
        }
      }
      var beforeExit = () => {
        labels = new Set(labels.filter(Boolean));
        if (labels.size) {
          console.log('\n\nCharts Labels Translations');
          var labelsSheet = csvParse(fs.readFileSync(LABEL_SHEET_PATH, 'utf8'));

          if (!argv.type && !argv.id) {
            var removed = [];
            var unnecessary = [];
            labelsSheet.forEach(l => {
              if (!labels.has(l.de)) {
                if (!l.en) {
                  removed.push(l.de);
                } else {
                  unnecessary.push(l.de);
                }
              }
            });
            labelsSheet = labelsSheet.filter(l => labels.has(l.de) || l.en);

            console.log('Unnecessary', unnecessary);
            console.log('Removed', removed);
          }

          var added = [];
          labels.forEach(label => {
            let labelsSheetEntry = labelsSheet.find(l => l.de === label);
            if (!labelsSheetEntry) {
              added.push(label);
              labelsSheet.push({
                de: label,
                en: ''
              });
            }
          });
          console.log('Added', added);

          // Uncomment to add info about usage of a label
          // if (!argv.type && !argv.id) {
          //   labelsSheet.forEach(label => {
          //     label.charts = Array.from(labelUsers[label.de] || []).join(',')
          //   });
          // } else {
          //   Object.keys(labelUsers).forEach(label => {
          //     if (!label) {
          //       return;
          //     }
          //     let labelsSheetEntry = labelsSheet.find(l => l.de === label);
          //     if (labelsSheetEntry) {
          //       let users = (labelsSheetEntry.charts || '').split(',').filter(Boolean);
          //       labelsSheetEntry.charts = Array.from(new Set(users.concat(Array.from(labelUsers[label])))).join(',');
          //     }
          //   })
          // }

          fs.writeFileSync(LABEL_SHEET_PATH, csvFormat(labelsSheet), 'utf8');
        }
      }

      var jobs = charts
        .reduce(
          (jobs, chart) => {
            ['de', 'en'].forEach(locale => {
              if (!argv.locale || argv.locale.indexOf(locale) > -1) {
                jobs.push({id: chart.id, locale});
              }
            });
            return jobs;
          },
          []
        );
      var unfinished = jobs.length;

      var runPhantom = (job) => {
        if (!job) {
          return;
        }
        var program = phantomjs.exec('script/phantom-charts.js', `http://${host}:${port}`, job.id, job.locale);
        program.stdout.pipe(process.stdout);
        program.stderr.pipe(process.stderr);
        program.on('exit', code => {
          console.log(`[phantomjs] ${job.id} for ${job.locale} exited with ${code}`);
          if (code === null) {
            console.log(`[phantomjs] retry`);
            runPhantom(job);
            return;
          }

          afterJob(job);
          unfinished -= 1;
          if (unfinished === 0) {
            beforeExit();
            process.exit(code);
          } else {
            runPhantom(jobs.shift());
          }
        });
      };

      runPhantom(jobs.shift());
    });
  });
});
