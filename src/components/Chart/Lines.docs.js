import React from 'react';
import {Page} from 'catalog';
import {ChartList, NumberFormats} from './Helpers.docs';

export default () => {
  const type = /(Line$|Slope$)/;

  return (
    <Page>
      <p><ChartList filter={chart => chart.type.match(type)} count /></p>
      <h3>Number Formats</h3>
      <NumberFormats defaultFormat='%' type={type} />
      <h3>Line Charts</h3>
      <ChartList filter={chart => chart.type.match(/Line$/)} />
      <h3>Slope Charts</h3>
      <ChartList filter={chart => chart.type.match(/Slope$/)} />
    </Page>
  );
};
