import PropTypes from 'prop-types';
import React from 'react';
import {withCabinet} from 'cabinet';
import CabinetChart from 'components/Chart/CabinetChart';

const List = ({charts, filter, count}) => {
  const list = charts.filter(filter || Boolean);

  if (count) {
    return <span>{list.length} charts {!!list.length && '–'} {list.map(d => d.id).join(', ')}</span>;
  }

  return (
    <div style={{width: '100%'}}>
      {
        list.map(chart => (
          <div key={chart.id} style={{marginBottom: 40}}>
            { chart.status.match(/plotted/) ? (
                <CabinetChart id={chart.id} />
              ) : (
                <p>Placeholder {chart.id} – {chart.type} – {chart.title}</p>
              )
            }
          </div>
        ))
      }
    </div>
  );
};

List.defaultProps = {};

List.propTypes = {
  count: PropTypes.bool,
  charts: PropTypes.array.isRequired,
  filter: PropTypes.func
};

export const ChartList = withCabinet(
  ({cabinet: {locale}}) => ({charts: `charts.${locale}.csv`})
)(List);

const numberFormatRegex = format => new RegExp(`"numberFormat": *"[^"]*${format}`, 'i');

export const NumberFormats = ({type, formats, defaultFormat}) => {
  return (<ul>
    <li>{defaultFormat}: <ChartList filter={chart => chart.type.match(type) && (
      !chart.config.match(/"numberFormat":/) || chart.config.match(numberFormatRegex(defaultFormat))
    )} count /></li>
    {
      formats.filter(format => format !== defaultFormat).map(format => (
        <li key={format}>{format}: <ChartList filter={chart => chart.type.match(type) && chart.config.match(numberFormatRegex(format))} count /></li>
      ))
    }
    <li>Others: <ChartList filter={chart => chart.type.match(type) && (
      chart.config.match(/"numberFormat":/) && !chart.config.match(numberFormatRegex(formats.concat(defaultFormat).join('|')))
    )} count /></li>
  </ul>);
};

NumberFormats.defaultProps = {
  formats: ['%', 's', 'f']
};
NumberFormats.propTypes = {
  formats: PropTypes.array.isRequired,
  defaultFormat: PropTypes.string.isRequired,
  type: PropTypes.object.isRequired
};
