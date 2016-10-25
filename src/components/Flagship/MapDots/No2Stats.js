import React, {PropTypes} from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import renderMarkdown from 'components/Markdown/renderMarkdown';
import {defaultReportVisitors} from 'components/Report/ReportPageComponents';
import {FencedItemList} from 'components/FencedItemList/FencedItemList';
import replaceText from 'components/Markdown/replaceText';
import {descending} from 'd3-array';

import {StyleSheet, css} from 'aphrodite';
import {sansBold14, sansRegular14} from 'theme/typeface';
import {hcl} from 'd3-color';

const styles = StyleSheet.create({
  label: {
    ...sansRegular14,
    padding: '4px 0'
  },
  value: {
    ...sansBold14,
    padding: '0 10px',
    borderRadius: '12px',
    float: 'right',
    textAlign: 'right'
  }
});

const No2Stats = ({t, userLocation, userAgs, node, data, numberFormat, colorScale}) => {
  if (!userLocation) return null;

  let no2Municipality = userLocation.get('no2Municipality');
  let stations = data.filter(d => d.ags === userAgs).sort((a, b) => descending(+a.value, +b.value));

  const {children} = replaceText(node, {
    userMunicipality: userLocation.get('name'),
    municipalityWithNo2: (no2Municipality || userLocation).get('name')
  });

  return renderMarkdown({type: 'root', children}, {visitors: {
    ...defaultReportVisitors(t),
    zone: (zNode, index, parent, visitChildren) => {
      if (zNode.name === 'NoStations' && no2Municipality) {
        return visitChildren(zNode);
      }
      return null;
    },
    marker: (mNode, index) => {
      if (mNode.name === 'PersonalizedStationList') {
        return (
          <div key={index} style={{marginTop: -10, marginBottom: 20}}>
            <FencedItemList items={stations.map(station => {
              const color = hcl(colorScale(+station.value));
              return (
                <div key={station.id} className={css(styles.label)}>
                  {station.name}
                  <div className={css(styles.value)} style={{
                    backgroundColor: color.toString(),
                    color: color.l > 55 ? 'black' : 'white'
                  }}>{numberFormat(station.value)}</div>
                </div>
              );
            })} />
          </div>
        );
      }
      return null;
    }
  }});
};

No2Stats.propTypes = {
  t: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  numberFormat: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired,
  userLocation: ImmutablePropTypes.map,
  userAgs: PropTypes.string
};

export default No2Stats;
