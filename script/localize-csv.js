import rw from 'rw';
import {join} from 'path';
import {csvParse, csvFormat} from 'd3-dsv';

const argv = require('minimist')(process.argv.slice(2));
const resolveRoot = path => join(__dirname, '../', path);

const input = csvParse(rw.readFileSync('/dev/stdin', 'utf8'));
const outPath = argv.out;
const rmCols = new Set((argv.rmCols || '').split(','));

const localizedColumns = new Set(
  input.columns
    .filter(name => name.match(/_en$/))
    .map(name => name.replace(/_en$/, ''))
);
const columns = input.columns
  .filter(name => !name.match(/_en$/))
  .filter(name => !rmCols.has(name));

const outputDe = input.map(row => {
  let localizedRow = {};

  columns.forEach(column => {
    localizedRow[column] = row[column];
  });
  return localizedRow;
});
rw.writeFileSync(resolveRoot(`${outPath}.de.csv`), csvFormat(outputDe), 'utf8');

const outputEn = input.map(row => {
  let localizedRow = {};

  columns.forEach(column => {
    if (localizedColumns.has(column)) {
      localizedRow[column] = row[`${column}_en`];
    } else {
      localizedRow[column] = row[column];
    }
  });
  return localizedRow;
});
rw.writeFileSync(resolveRoot(`${outPath}.en.csv`), csvFormat(outputEn), 'utf8');
