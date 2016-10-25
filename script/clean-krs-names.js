import rw from 'rw';
import {csvParse, csvFormat} from 'd3-dsv';

// developed for krs-mpidr-396-names.csv
// usage: cat src/data/krs-mpidr-396-names.csv | $(npm bin)/babel-node script/clean-krs-names.js > src/data/krs-mpidr-396-names.csv

let input = csvParse(rw.readFileSync('/dev/stdin', 'utf8'));

let output = [];

input.forEach(krs => {
  if (!krs.plainName) {
    krs.plainName = krs.name.split('(')[0].trim();
  }
});

// dedup
input = input.filter((krs, krsI) => krs.id !== 'id' && !input.find((d, i) => {
  return (
    i < krsI &&
    // d.name === krs.name &&
    // d.plainName === krs.plainName &&
    d.ds === krs.ds &&
    d.id === krs.id
  );
}));

const fixedNames = {
  '13991': 'Mecklenburgische Seenplatte und Vorpommern-Greifswald',
  '15991': 'Dessau-Roßlau, Anhalt-Bitterfeld, Jerichower Land und Wittenberg',
  '15992': 'Harz und Salzlandkreis',
  '16063': 'Eisenach und Wartburgkreis'
};

input.forEach(krs => {
  const fixedName = fixedNames[krs.id];
  const many = input.filter(k => (
    k.plainName === krs.plainName &&
    k.ds === krs.ds
  )).length > 1;

  output.push({
    ds: krs.ds,
    id: krs.id,
    name: fixedName || (many ? krs.name : krs.plainName)
  });
});

rw.writeFileSync('/dev/stdout', csvFormat(output), 'utf8');
