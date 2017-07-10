import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import {Link} from 'react-router';

import {dimensionBackgroundColorStyle, dimensionTextColorStyle, primaryDimensionButtonStyle, secondaryDimensionButtonStyle} from 'theme/colors';
import {sansRegular16, sansRegular22, sansBold15, sansBold40, sansBold90} from 'theme/typeface';

import {allDimensionIds, dimensionTitle, keyFact} from 'utils/dimension';


const styles = StyleSheet.create({
  root: {
    margin: 'auto',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',

    borderRadius: 8,
    padding: '24px 40px',

    width: 400,
    height: 480,

    boxShadow: '0px 0px 12px 0px rgba(0,0,0,0.25)',
  },
  title: {
    ...sansRegular22,
    width: '100%', // IE11 needs this
  },
  content: {
    margin: 'auto',
    width: '100%', // IE11 needs this
  },
  valueBlock: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  value: {
    ...sansBold90
  },
  unit: {
    ...sansBold40,
  },
  text: {
    ...sansRegular16,
  },
  button: {
    ...sansBold15,
    width: 210,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    textDecoration: 'none',
    textTransform: 'uppercase',
  },
});

export class DesktopDetailView extends Component {
  constructor(props) {
    super(props);

    allDimensionIds.forEach(dimensionId => {
      this.style(dimensionId);
    });
  }

  style(dimensionId) {
    return {
      root: css(styles.root, dimensionBackgroundColorStyle(dimensionId), dimensionTextColorStyle(dimensionId)),
      primaryButton: css(primaryDimensionButtonStyle(dimensionId), styles.button),
      secondaryButton: css(secondaryDimensionButtonStyle(dimensionId), styles.button),
    };
  }

  render() {
    const {t, dimensions, dimensionId} = this.props;
    const {keyFactValue, keyFactUnit, keyFactText}
      = keyFact(dimensions, dimensionId);

    const style = this.style(dimensionId);

    return (
      <div className={style.root}>
        <div className={css(styles.title)}>{dimensionTitle(dimensions, dimensionId)}</div>

        <div className={css(styles.content)}>
          <div className={css(styles.valueBlock)}>
            <div className={css(styles.value)}>{keyFactValue}</div>
            <div className={css(styles.unit)}>{keyFactUnit}</div>
          </div>
          <div className={css(styles.text)}>{keyFactText}</div>
        </div>

        <Link to={t(`route/report-${dimensionId}`)} className={style.primaryButton}>
          {t('landing-page/detail-view/read-report')}
        </Link>
        <Link to={t(`route/dimension-${dimensionId}`)} className={style.secondaryButton}>
          {t('landing-page/detail-view/view-indicators')}
        </Link>
      </div>
    );
  }
}

DesktopDetailView.propTypes = {
  t: PropTypes.func.isRequired,
  dimensions: PropTypes.array.isRequired,
  dimensionId: PropTypes.any.isRequired,
};
