import React, {Component, PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {Link} from 'react-router';

import {ChevronDownIcon12} from 'components/Icons/Icons';
import DimensionIcon from '../Icons/Dimension.svg';
import LargeReportIcon from '../Icons/LargeReport.svg';
import LargeIndicatorIcon from '../Icons/LargeIndicator.svg';

import {sansRegular18, serifRegular18, sansBold13} from 'theme/typeface';
import {text, white, softBeige} from 'theme/constants';
import {m as mUp} from 'theme/mediaQueries';

import {shallowEqual} from 'utils/shallowEqual';


const styles = StyleSheet.create({
  root: {
    ...serifRegular18,

    position: 'relative',

    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',

    minHeight: 200,

    padding: '40px 0',

    [mUp]: {
      flexDirection: 'row',
    }
  },

  img: {
    display: 'block',
  },

  button: {
    ...sansBold13,
    marginTop: 8,

    textDecoration: 'none',
    textTransform: 'uppercase',
    textAlign: 'center',

    width: 130,
    height: 32,
    borderRadius: 2,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: text,
    color: white,
  },

  backgroundBox: {
    flex: 1,
    textAlign: 'center',
    [mUp]: {
      backgroundColor: softBeige,
      borderRadius: 4,
      padding: 24,
    }
  },

  paragraph: {
    ...sansRegular18,
    color: text,

    flex: 1,
  },

  dimension: {
    position: 'absolute',
    top: 40 - 8,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    opacity: 1,
    transition: 'opacity 0.3s',
  },
  arrowIndicator: {
    opacity: 1,
    transition: 'opacity .2s',

    position: 'absolute',
    top: 180,
    left: '50%',
    transform: 'translate(-50%, -8px)',
  },

  report: {
    opacity: 0,
    transition: 'opacity 0.3s',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    marginRight: 10,
  },
  indicator: {
    opacity: 0,
    transition: 'opacity 0.3s',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    marginLeft: 10,
  },
});

const stageStyles = {
  [0]: StyleSheet.create({
  }),
  [1]: StyleSheet.create({
    dimension: {
      opacity: 0,
    },
    arrowIndicator: {
      opacity: 0,
    },
    report: {
      opacity: 1,
    },
    indicator: {
      opacity: 1,
    }
  }),
};

export class Menu extends Component {
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  render() {
    const {t, stageIndex} = this.props;

    return (
      <div className={css(styles.root)}>
        <div className={css(styles.dimension, stageStyles[stageIndex].dimension)}>
          <img src={DimensionIcon} alt='' className={css(styles.img)} />
          {t('landing-page/table-of-contents/dimensions')}
        </div>

        <div className={css(styles.arrowIndicator, stageStyles[stageIndex].arrowIndicator)}>
          <ChevronDownIcon12 color={text} />
        </div>

        <div className={css(styles.backgroundBox, styles.report, stageStyles[stageIndex].report)}>
          <img src={LargeReportIcon} alt='' className={css(styles.img)} />
          {t('landing-page/table-of-contents/report')}
          <p className={css(styles.paragraph)}>
            {t('landing-page/mobile/menu/report/paragraph')}
          </p>
          <Link to={t('route/report-01')} className={css(styles.button)}>
            {t('landing-page/mobile/menu/report/button-label')}
          </Link>
        </div>
        <div className={css(styles.backgroundBox, styles.indicator, stageStyles[stageIndex].indicator)}>
          <img src={LargeIndicatorIcon} alt='' className={css(styles.img)} />
          {t('landing-page/table-of-contents/indicators')}
          <p className={css(styles.paragraph)}>
            {t('landing-page/mobile/menu/indicators/paragraph')}
          </p>
          <Link to={t('route/dashboard')} className={css(styles.button, stageStyles[stageIndex].button)}>
            {t('landing-page/mobile/menu/indicators/button-label')}
          </Link>
        </div>
      </div>
    );
  }
}

Menu.propTypes = {
  t: PropTypes.func.isRequired,
  stageIndex: PropTypes.number.isRequired,
};
