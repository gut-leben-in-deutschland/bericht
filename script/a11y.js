/* eslint-disable no-console */

const pa11y = require('pa11y');
const argv = require('minimist')(process.argv.slice(2));
const phantomjs = require('phantomjs-prebuilt');
const glob = require('glob');
const resolveRoot = require('path').resolve.bind(null, __dirname, '..');
const join = require('path').join;
const async = require('async');
const {descending} = require('d3-array');
const {nest} = require('d3-collection');
const {tsvFormat} = require('d3-dsv');
const rw = require('rw');
const fs = require('fs');
const clc = require('cli-color');
const htmlReporter = require('pa11y/reporter/html');
const cliReporter = require('pa11y/reporter/cli');
const name = require('../package.json').name;

let urlsToCheck = [];

let cwd;
if (argv.path) {
  cwd = resolveRoot(argv.path);
  const files = glob.sync('**/*.html', {cwd});

  urlsToCheck = urlsToCheck.concat(files.map(file => {
    return `file://${join(cwd, file)}`;
  }));
}

if (argv.url) {
  urlsToCheck = urlsToCheck.concat([
    argv.url
  ]);
}

const test = pa11y({
  hideElements: '.CabinetBar',
  phantom: {
    path: phantomjs.path
  },
  ignore: [
    // manuel absolute positioned element contrast check
    'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Abs', 'WCAG2AA.Principle1.Guideline1_4.1_4_3.G145.Abs',
    // manuel link context check
    'WCAG2AA.Principle2.Guideline2_4.2_4_4.H77,H78,H79,H80,H81',
    // disable this because color legends do not use foreground colors
    'WCAG2AA.Principle1.Guideline1_4.1_4_3_F24.F24.BGColour'
  ]
});

const ignoreForExitCode = [
  // contrast errors should not fail the build, some are irrelevant too
  'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail', 'WCAG2AA.Principle1.Guideline1_4.1_4_3.G145.Fail'
];

let results = [];
const concurrency = 4;
const queue = async.queue((url, done) => {
  test.run(url, (error, urlResults) => {
    if (error) {
      console.error(error.message);
    } else {
      let normalizedUrl = url;
      if (cwd) {
        normalizedUrl = normalizedUrl.replace(`file://${cwd}`, '');
      }
      urlResults.forEach(result => {
        result.url = normalizedUrl;
      });
      results = results.concat(urlResults);
    }
    done();
  });
}, concurrency);

const colors = {
  notice: clc.blue,
  warning: clc.yellow,
  error: clc.red.bold
};

queue.drain = () => {
  console.log(colors.error(`${results.length} Issues\n`));
  console.log(
    'Types\n' +
    nest().key(d => d.type).rollup(values => values.length).entries(results)
      .map(d => colors[d.key](`- ${d.value}\t${d.key}`))
      .join('\n')
  );
  const codes = nest().key(d => `${d.code} (${d.type})`).entries(results)
    .sort((a, b) => descending(a.values.length, b.values.length));
  console.log(
    '\nCodes\n' +
    codes
      .map(d => colors[d.values[0].type](`- ${d.values.length}\t${d.key}`))
      .join('\n')
  );
  console.log(
    '\nUrls\n' +
    nest().key(d => d.url).rollup(values => values.length).entries(results)
      .sort((a, b) => descending(a.value, b.value)).slice(0, 10)
      .map(d => `- ${d.value}\t${d.key}`)
      .join('\n')
  );

  const topErrors = codes.filter(d => d.values[0].type === 'error').slice(0, 3);
  if (topErrors.length) {
    console.log('\n\nTop Error Examples\n');
    topErrors.forEach(d => {
      const error = d.values[0];
      console.log(`${error.code}`);
      cliReporter.results(d.values.filter(e => e.url === error.url).slice(0, 3), error.url);
    });
  } else {
    const topWarnings = codes.filter(d => d.values[0].type === 'warning').slice(0, 3);
    if (topWarnings.length) {
      console.log('\n\nTop Warning Examples\n');
      topWarnings.forEach(d => {
        const warning = d.values[0];
        console.log(`${warning.code}`);
        cliReporter.results(d.values.filter(e => e.url === warning.url).slice(0, 3), warning.url);
      });
    }
  }


  if (argv.url) {
    cliReporter.results(results.filter(r => r.url === argv.url), argv.url);
  }

  if (argv.path) {
    const dir = 'a11y-report';
    if (!fs.existsSync(resolveRoot(dir))) {
      fs.mkdirSync(resolveRoot(dir));
    }

    rw.writeFileSync(resolveRoot(`${dir}/report.tsv`), tsvFormat(results), 'utf8');
    rw.writeFileSync(resolveRoot(`${dir}/report.html`), htmlReporter.process(results, name), 'utf8');

    console.log(colors.notice(`\n\nReport written to ${dir}`));
  }

  const exitCodeErrors =  results
    .filter(r => r.type === 'error' && ignoreForExitCode.indexOf(r.code) === -1);

  if (exitCodeErrors.length) {
    cliReporter.results(exitCodeErrors, 'Exit Code Relevant Errors');
    process.exit(1);
  } else {
    process.exit(0);
  }
};

queue.push(urlsToCheck);
