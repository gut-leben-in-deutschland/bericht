import React from 'react';
import {Page} from 'catalog';
import {ChartList} from './Helpers.docs';
import {mapTypes} from './Maps.docs';

const types = /Slope|Line|Lollipop|BoxPlot|Bar$/;

export default () => (
  <Page>
    <p><ChartList filter={chart => !chart.type.match(types) && !chart.type.match(mapTypes)} count /></p>
    <h2>Index</h2>
    <ChartList filter={chart => !chart.type.match(types) && !chart.type.match(mapTypes)} />
  </Page>
);
