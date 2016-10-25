import React, {PropTypes} from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Chart from 'components/Chart/Chart';
import {withCabinet} from 'cabinet';
import {List, Map} from 'immutable';

import {createSelector} from 'reselect';

const selectTLabel = createSelector(
  props => props.locale,
  props => props.translations,
  (locale, translations) => {
    if (locale === 'de') {
      if (__PHANTOM__) {
        // facilitate label collection
        window.chartLabels = [];
        return key => {
          window.chartLabels.push(key);
          return key;
        };
      }
      return key => key;
    }
    const map = Map(translations.map(translation => [translation.de, translation.en]));
    if (__PHANTOM__) {
      return key => {
        if (key && !map.has(key)) {
          // eslint-disable-next-line no-console
          console.error(`Missing chart label translation ${key}`);
        }
        return map.get(key, key);
      };
    }
    return key => map.get(key, key);
  }
);

export const ChartFromConfig = withCabinet(
  ({config}) => {
    const files = {
      translations: 'charts-labels-translations.csv'
    };
    if (config.get('type') !== 'Static') {
      files.values = config.get('data');
    }
    return files;
  }
)(
  ({values, config, translations, cabinet: {t, locale}, description, license}) => <Chart
    values={List(values)}
    type={config.get('type')}
    description={description}
    license={license}
    config={config.delete('type')}
    locale={locale}
    t={t}
    tLabel={selectTLabel({locale, translations})} />
);

ChartFromConfig.propTypes = {
  config: ImmutablePropTypes.map.isRequired,
  description: PropTypes.object.isRequired,
  license: PropTypes.object
};

const CabinetChart = withCabinet(
  ({cabinet: {locale}}) => ({
    charts: `charts.${locale}.csv`,
    licenses: `licenses.${locale}.csv`
  })
)(
  ({charts, licenses, id, config, children}) => {
    let inlineId;
    let inlineConfig;
    let inline = (children || '').split('---').map(d => d.trim());
    if (inline.length > 1) {
      inlineId = inline[0];
      inlineConfig = inline[1];
    } else if (inline[0][0] === '{') {
      inlineConfig = inline[0];
    } else {
      inlineId = inline[0];
    }

    if (inlineConfig) {
      try {
        inlineConfig = JSON.parse(inlineConfig);
      } catch (e) {
        return (
          <div>
            Inline chart {inlineId ? `(${inlineId})` : ''} config does not seem to be valid JSON
            <pre><code>{inlineConfig}</code></pre>
          </div>
        );
      }
    }

    const chartId = id || inlineId || inlineConfig.id;
    const chart = charts.find(c => c.id === chartId);
    if (!chart) {
      return <div>Unknown chart {chartId}</div>;
    }

    let finalConfig = Map({
      type: chart.type,
      data: chart.data
    });
    if (chart.config) {
      try {
        finalConfig = finalConfig.merge(JSON.parse(chart.config));
      } catch (e) {
        return (
          <div>
            Chart config ({chartId}) does not seem to be valid JSON
            <pre><code>{chart.config}</code></pre>
          </div>
        );
      }
    }
    finalConfig = finalConfig.merge(config).merge(inlineConfig);

    const data = finalConfig.get('data');
    const license = licenses.find(l => l.data === data);

    return <ChartFromConfig config={finalConfig} description={chart} license={license} />;
  }
);

CabinetChart.propTypes = {
  id: PropTypes.string,
  config: PropTypes.object,
  children: PropTypes.string
};

export default CabinetChart;
