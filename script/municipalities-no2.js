import rw from 'rw';
import {join} from 'path';
import {csvParse, csvFormat} from 'd3-dsv';
import {nest} from 'd3-collection';
import {List} from 'immutable';
import {geoDistance} from 'd3-geo';

const municipalities = csvParse(rw.readFileSync('/dev/stdin', 'utf8'));
const rootFolder = [__dirname, '../'];
const no2 = csvParse(
  rw.readFileSync(
    join(...rootFolder, 'content/10/01/no2-points.csv'),
    'utf8'
  )
);
const agsWithNo2 = nest().key(d => d.ags).object(no2);
const municipalitiesWithNo2 = List(municipalities.filter(m => agsWithNo2[m.id]));

const output = municipalities.map(({lon, lat, ...m}) => {
  // let no2Km;
  let no2Ags;
  if (!agsWithNo2[m.id]) {
    const coordinates = [lon, lat];
    const closest = municipalitiesWithNo2.sortBy(mWNo2 => {
      return geoDistance([mWNo2.lon, mWNo2.lat], coordinates);
    }).first();

    no2Ags = closest.id;
    // no2Km = Math.round(geoDistance([closest.lon, closest.lat], coordinates) * 6371);
  }
  return {
    ...m,
    no2Ags,
    // no2Km
  };
});

rw.writeFileSync('/dev/stdout', csvFormat(output), 'utf8');
