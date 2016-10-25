import rw from 'rw';
import {csvParse, csvFormat} from 'd3-dsv';

// developed for 07-03
// usage: cat $HOME/Desktop/breitband-gem.csv | $(npm bin)/babel-node script/transpose-municipalities.js > content/07/03/municipalities.csv

const input = csvParse(rw.readFileSync('/dev/stdin', 'utf8').split('\n').slice(9).join('\n'));

let output = [];

input.forEach(line => {
  const base = {
    gem: line.AGS,
    // gem_name: line.Gemeinde
  };

  [2010, 2015].forEach(year => {
    output.push({
      ...base,
      year,
      value: line[`Ende ${year}`] / 100
    });
  });
  // output.push({
  //   ...base,
  //   year: 'Differenz 2010-2015',
  //   value: line['Differenz  2010-2015'] / 100
  // });
});

rw.writeFileSync('/dev/stdout', csvFormat(output), 'utf8');
