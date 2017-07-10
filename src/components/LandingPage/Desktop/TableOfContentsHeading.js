import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';

import DimensionIcon from '../Icons/Dimension.svg';
import LargeReportIcon from '../Icons/LargeReport.svg';
import LargeIndicatorIcon from '../Icons/LargeIndicator.svg';
import SmallReportIcon from '../Icons/SmallReport.svg';
import SmallIndicatorIcon from '../Icons/SmallIndicator.svg';

import {serifRegular22, serifRegular26} from 'theme/typeface';
import {text} from 'theme/constants';

import {shallowEqual} from 'utils/shallowEqual';


const height = 220;
const transitionDuration = '.4s';

const styles = StyleSheet.create({
  root: {
    height: height,
    width: '100%',
    position: 'relative',
    marginBottom: 40,
  },

  dimension: {
    ...serifRegular22,
    color: text,
    textAlign: 'center',

    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%,-50%)',
    opacity: 1,

    transition: 'opacity .1s',
    transitionDuration,

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  report: {
    ...serifRegular22,
    color: text,
    textAlign: 'center',

    position: 'absolute',
    left: '50%',
    bottom: '50%',
    transform: 'translate(-50%, 50%)',
    opacity: 0,

    transition: 'bottom: .1s, left .1s, opacity .1s',
    transitionDuration,

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  indicator: {
    ...serifRegular22,
    color: text,
    textAlign: 'center',

    position: 'absolute',
    right: '50%',
    bottom: '50%',
    transform: 'translate(50%, 50%)',
    opacity: 0,

    transition: 'bottom: .1s, right .1s, opacity .1s',
    transitionDuration,

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  final: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: height,
    opacity: 0,
    transition: 'opacity .1s',
    transitionDuration,
  },
  heading: {
    ...serifRegular26,
    color: text,
    textAlign: 'center',
  },
  bottom: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sideLabel: {
    ...serifRegular22,
    color: text,

    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideLabelText: {
    margin: '0 12px',
  },
});

const stageStyles = {
  [0]: StyleSheet.create({
  }),
  [1]: StyleSheet.create({
    dimension: {
      opacity: 0,
    },
    report: {
      opacity: 1,
      left: '25%',
    },
    indicator: {
      opacity: 1,
      right: '25%',
    },
  }),
  [2]: StyleSheet.create({
    dimension: {
      opacity: 0,
    },
    report: {
      opacity: 0,
      bottom: 0,
      left: 0,
      transform: 'scale(.2) translate(-50%, 50%)',
    },
    indicator: {
      opacity: 0,
      bottom: 0,
      right: 0,
      transform: 'scale(.2) translate(-50%, 50%)',
    },
    final: {
      opacity: 1,
    }
  }),
};

export class TableOfContentsHeading extends Component {
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  render() {
    const {t, stageIndex} = this.props;
    return (
      <div className={css(styles.root)}>
        <div className={css(styles.dimension, stageStyles[stageIndex].dimension)} aria-hidden>
          <img src={DimensionIcon} alt='' />
          {t('landing-page/table-of-contents/dimensions')}
        </div>

        <div className={css(styles.report, stageStyles[stageIndex].report)} aria-hidden>
          <img src={LargeReportIcon} alt='' />
          {t('landing-page/table-of-contents/report')}
        </div>
        <div className={css(styles.indicator, stageStyles[stageIndex].indicator)} aria-hidden>
          <img src={LargeIndicatorIcon} alt='' />
          {t('landing-page/table-of-contents/indicators')}
        </div>

        <div className={css(styles.final, stageStyles[stageIndex].final)}>
          <h1 className={css(styles.heading)}>{t('landing-page/table-of-contents/heading')}</h1>
          <div className={css(styles.bottom)} aria-hidden>
            <div className={css(styles.sideLabel)}>
              <img src={SmallReportIcon} alt='' />
              <div className={css(styles.sideLabelText)}>{t('landing-page/table-of-contents/report')}</div>
            </div>
            <div className={css(styles.sideLabel)}>
              <div className={css(styles.sideLabelText)}>{t('landing-page/table-of-contents/indicators')}</div>
              <img src={SmallIndicatorIcon} alt='' />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

TableOfContentsHeading.propTypes = {
  t: PropTypes.any.isRequired,
  stageIndex: PropTypes.any.isRequired
};
