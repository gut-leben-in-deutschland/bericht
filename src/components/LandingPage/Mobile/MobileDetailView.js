import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import {Link} from 'react-router';

import {ChevronLeftIcon18, ChevronRightIcon18, CloseIcon12} from 'components/Icons/Icons';

import {dimensionBackgroundColorStyle, dimensionTextColorStyle, primaryDimensionButtonStyle, secondaryDimensionButtonStyle} from 'theme/colors';
import {sansRegular16, sansBold15, serifBold22, sansBold40, sansBold90} from 'theme/typeface';
import {onlyXS} from 'theme/mediaQueries';

import {allDimensionIds, dimensionTitle, dimensionTextColor, keyFact} from 'utils/dimension';


const styles = StyleSheet.create({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',

    zIndex: 10,

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',

    transition: 'background-color .35s, color .35s',
  },

  nav: {
    minHeight: 130,
    width: '100%',

    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  title: {
    ...serifBold22,
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    [onlyXS]: {
      fontSize: 20
    }
  },
  navIcon: {
    padding: '0 20px',
    cursor: 'pointer',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  rest: {
    // We need a lot of bottom padding because of the iOS tab bar which appears when it's hidden and you tap in its area. Therefore the close icon button can't be there.
    padding: '0 24px 68px 24px',
    flexGrow: 1,

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    textAlign: 'center',
  },

  content: {
    flexGrow: 1,
    marginBottom: 24,
  },
  valueBlock: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  value: {
    ...sansBold90,
    [onlyXS]: {
      fontSize: 64
    }
  },
  unit: {
    ...sansBold40,
    [onlyXS]: {
      fontSize: 24
    }
  },
  text: {
    ...sansRegular16,
  },
  buttons: {
    margin: 'auto',
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

  closeIcon: {
    cursor: 'pointer',
    width: '100%',
    lineHeight: '40px'
  },
});

export class MobileDetailView extends Component {
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
    const {t, dimensions, dimensionId, gotoNext, gotoPrevious, onClose} = this.props;
    const {keyFactValue, keyFactUnit, keyFactText}
      = keyFact(dimensions, dimensionId);

    const style = this.style(dimensionId);

    return (
      <div className={style.root}>
        <div className={css(styles.nav)}>
          <div className={css(styles.navIcon)} onClick={gotoPrevious} role='button'>
            <ChevronLeftIcon18 color={dimensionTextColor(dimensionId)} />
          </div>

          <div className={css(styles.title)}>{dimensionTitle(dimensions, dimensionId)}</div>

          <div className={css(styles.navIcon)} onClick={gotoNext} role='button'>
            <ChevronRightIcon18 color={dimensionTextColor(dimensionId)} />
          </div>
        </div>

        <div className={css(styles.rest)}>
          <div className={css(styles.content)}>
            <div className={css(styles.valueBlock)}>
              <div className={css(styles.value)}>{keyFactValue}</div>
              <div className={css(styles.unit)}>{keyFactUnit}</div>
            </div>
            <div className={css(styles.text)}>{keyFactText}</div>
          </div>

          <div className={css(styles.buttons)}>
            <Link to={t(`route/report-${dimensionId}`)} className={style.primaryButton}>
              {t('landing-page/detail-view/read-report')}
            </Link>
            <Link to={t(`route/dimension-${dimensionId}`)} className={style.secondaryButton}>
              {t('landing-page/detail-view/view-indicators')}
            </Link>
            <div className={css(styles.closeIcon)} onClick={onClose} role='button'>
              <CloseIcon12 color={dimensionTextColor(dimensionId)} />
            </div>
          </div>

        </div>
      </div>
    );
  }
}

MobileDetailView.propTypes = {
  t: PropTypes.func.isRequired,
  dimensions: PropTypes.array.isRequired,
  dimensionId: PropTypes.any.isRequired,
  gotoNext: PropTypes.func.isRequired,
  gotoPrevious: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
