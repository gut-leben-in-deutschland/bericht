import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {Map, Set} from 'immutable';
import {LinkInline as Link} from 'components/ButtonLink/Link';
import {Grid, Span} from 'components/Grid/Grid';
import {StyleSheet, css} from 'aphrodite';
import {sansRegular12, sansBold20, sansBold12} from 'theme/typeface';
import {midGrey, darkGrey, link} from 'theme/constants';
import {m} from 'theme/mediaQueries';
import {dimensionSchemes} from 'utils/dimension';
import {FencedItemList, FenceLink} from 'components/FencedItemList/FencedItemList';
import subsup from 'utils/subsup';

import {measure} from 'utils/dom';
import {Line, Slope} from './Lines';
import Bar, {Lollipop} from './Bars';
import TimeBar from './TimeBars';
import BoxPlot from './BoxPlots';
import {PointMap, StatesMap, KRegMap, KrsMap} from './Maps';
import Static from './Static';
import {BKGLegend} from './utils';

const ReactCharts = {
  Slope,
  Line,
  Bar,
  Lollipop,
  TimeBar,
  BoxPlot,
  PointMap,
  KRegMap,
  KrsMap,
  StatesMap,
  Static
};
const TYPES_WITH_BKG_BASEDATA = Set(['StatesMap', 'KrsMap', 'KRegMap']);

const styles = StyleSheet.create({
  title: {
    ...sansBold20,
    color: darkGrey,
    marginBottom: 10
  },
  footer: {
    ...sansRegular12,
    color: midGrey
  },
  newDataLine: {
    display: 'block'
  },
  newDataLabel: {
    ...sansBold12,
    backgroundColor: link,
    color: '#fff',
    padding: '0 4px',
    borderRadius: 3,
    display: 'inline-block'
  },
  footerRight: {
    [m]: {
      textAlign: 'right'
    }
  }
});

class Chart extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.measure = measure((ref, {width}) => {
      if (width !== this.state.width) {
        this.setState({width});
      }
    });
  }
  render() {
    const {description, license, type, config, locale, t, tLabel, newData} = this.props;
    const {id} = description;

    const width = config.get('width') || this.state.width;
    const chromeless = config.get('chromeless', false);

    let [dimensionId] = id.split('-');
    if (id === '00-00-a') {
      dimensionId = '12';
    }
    const colorSchemes = dimensionSchemes(dimensionId);

    const header = !chromeless && (
      <div className={config.get('titleClassName') || css(styles.title)}>
        {subsup(description.title)}
      </div>
    );
    const hasBkgLegend = TYPES_WITH_BKG_BASEDATA.has(type);
    const hasSource = !!(description.source_label || description.source_annotation);

    const footer = !chromeless && (
      <div>
        <Grid>
          <Span m='3/6' s='2/2'>
            <p className={css(styles.footer)}>
              {hasSource && t('charts/source')}{' '}
              {!!(description.source_label || description.source_url) && <Link t={t} href={description.source_url}>{description.source_label}</Link>}
              {' '}{subsup(description.source_annotation)}
              {hasBkgLegend && (
                <span>
                  {hasSource ? <br /> : ''}
                  <BKGLegend t={t} />
                </span>
              )}
              {newData && (
                <span className={css(styles.newDataLine)}>
                  <span className={css(styles.newDataLabel)}>{t('dashboard/new-data')}</span>
                </span>
              )}
              {__DEV__ && !__PHANTOM__ && (<span><br />{id}</span>)}
              {config.get('copyright', false) && <span><br />{description.copyright || t('charts/copyright')}</span>}
            </p>
          </Span>
          <Span m='3/6' s='2/2'>
            {!!description.footnote && <p className={css(styles.footer, styles.footerRight)}>{subsup(description.footnote)}</p>}
          </Span>
        </Grid>
        {config.get('footerLinks', false) && <FencedItemList items={[
          <FenceLink t={t} to={require('assets/charts-' + locale + '/' + description.id + '.png')} target='_blank' icon='download'>{t('charts/image/label')}</FenceLink>,
          license && <FenceLink t={t} to={license.url} target='_blank'>{`${t('charts/license/label')} ${license.label}`}</FenceLink>,
          <FenceLink t={t} to={t('charts/github/url', {dataFile: description.data})}>{t('charts/github/label')}</FenceLink>,
        ].filter(Boolean)} />}
      </div>
    );

    const ReactChart = ReactCharts[type];

    return (
      <div ref={config.has('width') ? undefined : this.measure} style={{maxWidth: config.get('maxWidth')}}>
        {header}
        {!!width && (
          <ReactChart {...config.toJS()}
            locale={locale}
            t={t}
            tLabel={tLabel}
            colorSchemes={colorSchemes}
            width={width}
            values={this.props.values}
            id={id}
            description={description.alt_text}>
            {footer}
          </ReactChart>
        )}
      </div>
    );
  }
}

Chart.propTypes = {
  type: PropTypes.oneOf(Object.keys(ReactCharts)).isRequired,
  values: ImmutablePropTypes.iterable.isRequired,
  config: ImmutablePropTypes.map.isRequired,
  description: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string.isRequired,
    alt_text: PropTypes.string,
    source_url: PropTypes.string,
    source_label: PropTypes.string,
    source_annotation: PropTypes.string,
    footnote: PropTypes.string,
    copyright: PropTypes.string,
    data: PropTypes.string.isRequired
  }),
  license: PropTypes.shape({
    label: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
  }),
  locale: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  tLabel: PropTypes.func.isRequired,
  newData: PropTypes.bool.isRequired
};
Chart.defaultProps = {
  config: Map()
};

export default Chart;
