import React, {PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {withCabinet} from 'cabinet';
import {Link} from 'react-router';

import Chart from 'components/Indicator/Overview/Chart';

import {white, text, midGrey} from 'theme/constants';
import {dimensionBorderColorStyle} from 'theme/colors';
import {createMediaQuery} from 'theme/mediaQueries';
import {sansRegular14, sansBold20} from 'theme/typeface';

import {hyphenate} from 'utils/hyphenate';
import {dimensionTitle} from 'utils/dimension';


// The minimum width the card is allowed to shrink to. The container SHOULD
// ensure that this width never falls below this value.
export const minCardWidth = 310;


const cardShape = PropTypes.shape({
  dimensionId: PropTypes.string.isRequired,
  indicatorId: PropTypes.string.isRequired,

  dimension: PropTypes.string.isRequired,
  indicator: PropTypes.string.isRequired,
  chart: PropTypes.element.isRequired
});

const styles = StyleSheet.create({
  card: {
    // The magenta color is overridden using 'dimensionBorderColorStyle'.
    borderTop: '2px solid magenta',
    boxShadow: `0px 2px 4px 0px rgba(0,0,0,0.1)`,
    transition: 'box-shadow .2s',

    borderRadius: 1,
    backgroundColor: white,
    height: 304,
    padding: '32px 40px 20px',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 24,

    // Needed to reset styles which are added by react-router Link.
    textDecoration: 'none',

    [createMediaQuery(0, 2 * minCardWidth - 1)]: {
      padding: '28px 22px 22px'
    }
  },
  interactiveCard: {
    cursor: 'pointer',
    ':hover': {
      boxShadow: `0px 2px 24px 0px rgba(0,0,0,0.2)`
    }
  },
  cardDimension: {
    ...sansRegular14,
    color: midGrey
  },
  cardDimensionSmaller: {
    fontSize: 12
  },
  cardIndicator: {
    ...sansBold20,
    color: text,
    marginTop: 8
  },
  cardIndicatorSmaller: {
    fontSize: 18
  },
  cardIndicatorSmallest: {
    fontSize: 16
  },
  noDataAvailable: {
    ...sansRegular14,
    margin: 'auto',
    color: midGrey
  }
});

export function cardDataForIndicators(dimensions, indicators) {
  return indicators.map(({dimension_id, id, placeholder, mini_config, title}) => {
    const chart = placeholder === 'TRUE'
      ? <NoDataAvailable />
      : <Chart id={id} inlineConfig={mini_config} />;

    return {
      dimensionId: dimension_id,
      indicatorId: id,
      dimension: dimensionTitle(dimensions, dimension_id),
      indicator: title,
      chart: chart
    };
  });
}

function cond(bool, style) {
  return bool ? style : undefined;
}

export function Card({card: {dimensionId, indicatorId, dimension, indicator, chart}, locale, t}) {
  const dimensionString = hyphenate(locale, dimension);
  const cardDimensionClassName = css(styles.cardDimension,
    cond(dimensionString.length > 30, styles.cardDimensionSmaller));

  const indicatorString = hyphenate(locale, indicator);
  const cardIndicatorClassName = css(styles.cardIndicator,
    cond(indicatorString.length > 40, styles.cardIndicatorSmaller),
    cond(indicatorString.length > 68, styles.cardIndicatorSmallest));

  return (
    <Link to={t(`route/indicator-${indicatorId}`)} className={css(styles.card, dimensionBorderColorStyle(dimensionId), styles.interactiveCard)}>
      <div className={cardDimensionClassName}>{dimensionString}</div>
      <div className={cardIndicatorClassName}>{indicatorString}</div>
      {chart}
    </Link>
  );
}

Card.propTypes = {
  card: cardShape,
  locale: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired
};


export const NoDataAvailable = withCabinet()(function _NoDataAvailable({cabinet: {t}}) {
  return <div className={css(styles.noDataAvailable)}>{t('dashboard/cards/no-data-available')}</div>;
});
