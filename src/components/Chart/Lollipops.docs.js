import React from 'react';
import {Page} from 'catalog';
import {ChartList, NumberFormats} from './Helpers.docs';

export default () => (
  <Page>
    <p><ChartList filter={chart => chart.type.match(/Lollipop/)} count /></p>
    <h3>Number Formats</h3>
    <NumberFormats defaultFormat='s' type={/Lollipop/} />
    <h2>Index</h2>
    <ChartList filter={chart => chart.type.match(/Lollipop/)} />
  </Page>
);
