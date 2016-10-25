import React from 'react';
import {Page} from 'catalog';
import {ChartList, NumberFormats} from './Helpers.docs';

export default () => (
  <Page>
    <p><ChartList filter={chart => chart.type.match(/BoxPlot/)} count /></p>
    <h3>Number Formats</h3>
    <NumberFormats defaultFormat='s' type={/BoxPlot/} />
    <h2>Index</h2>
    <ChartList filter={chart => chart.type.match(/BoxPlot/)} />
  </Page>
);
