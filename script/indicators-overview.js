/* eslint-disable no-console */

import rw from 'rw';
import {join} from 'path';
import {csvParse, csvFormat} from 'd3-dsv';
import vgExpr from 'vega-expression';

const datumExpr = vgExpr.compiler(['datum']);

const rootFolder = [__dirname, '../'];
const indicators = csvParse(rw.readFileSync(join(...rootFolder, 'content/indicators.de.csv'), 'utf8'));

indicators
  .filter(indicator => indicator.placeholder !== 'TRUE')
  .forEach(indicator => {
    if (indicator.data) {
      const config = JSON.parse(indicator.mini_config);
      if (config.type === 'Static') {
        return;
      }
      let data = csvParse(rw.readFileSync(join(...rootFolder, 'content', indicator.data), 'utf8'));
      if (indicator.filter) {
        data = data.filter(datumExpr(indicator.filter).fn);
      } else {
        console.warn(`${indicator.id} doesn't use a data filter. This is suspicous. ${config.type}`);
      }
      rw.writeFileSync(join(...rootFolder, 'content', config.data), csvFormat(data), 'utf8');
    }
  });
