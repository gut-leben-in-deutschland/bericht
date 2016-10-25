import rw from 'rw';
import {csvParse, csvFormat} from 'd3-dsv';
// import {range} from 'd3-array';

// developed for 02-01, 07-03
// usage: cat $HOME/Desktop/alo.csv | $(npm bin)/babel-node script/transpose-districts.js > content/02/01/districts.csv

const input = csvParse(rw.readFileSync('/dev/stdin', 'utf8').split('\n').slice(1).join('\n'));

let years = input.columns.filter(column => column.trim().match(/^[0-9]{4}$/));
// let years = ['2010', '2015'];
// let years = range(15).map(i => `${i + 2000}`);
let output = [];

input.forEach(line => {
  const base = {
    krs: line.Kreise13 / 1000,
    // krs_name: line.Kreisname
  };
  // const base = {
  //   krs: line.KRS / 1000
  // };

  years.forEach(year => {
    // console.log(`ewpquote${year.slice(2)}`);
    output.push({
      ...base,
      year: year.trim(),
      value: line[year] / 100
      // value: line[`Ende ${year}`] / 100
      // value: line[` ewpquote${year.slice(2)} `] / 100
    });
  });
});

rw.writeFileSync('/dev/stdout', csvFormat(output), 'utf8');
