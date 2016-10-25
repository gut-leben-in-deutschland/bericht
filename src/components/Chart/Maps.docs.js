import React from 'react';
import {Page} from 'catalog';
import {ChartList, NumberFormats} from './Helpers.docs';

export const mapTypes = /PointMap|KRegMap|KrsMap|StatesMap/;

export default () => (
  <Page>
    <p><ChartList filter={chart => chart.type.match(mapTypes)} count /></p>
    <h3>Number Formats</h3>
    <NumberFormats defaultFormat='s' type={mapTypes} />
    <h2>Index</h2>
    <ChartList filter={chart => chart.type.match(mapTypes)} />
  </Page>
);
