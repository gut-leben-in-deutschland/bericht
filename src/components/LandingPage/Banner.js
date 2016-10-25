import React, {Component, PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';

import {NarrowContainer} from 'components/Grid/Grid';
import {headerHeight} from 'components/Header/Header';
import {ChevronDownIcon16} from 'components/Icons/Icons';

import {sansBold15, serifRegular40, serifRegular72, serifRegular94} from 'theme/typeface';
import {white, darkGrey, link} from 'theme/constants';
import {m as mUp, xl as xlUp, onlyS} from 'theme/mediaQueries';
import {bounceDownAnimation} from 'theme/animations';

import {shallowEqual} from 'utils/shallowEqual';
import {passiveEvent} from 'utils/dom';

import coverImage from 'components/LandingPage/Cover.svg';

import Link from 'components/ButtonLink/Link';
import {base as linkBaseStyle, blendedPrimaryButtonStyleObject} from 'components/ButtonLink/Styles';

// There is an implicit assumption that this component will be shown just
// below the page header, and it is set up to cover 70% of the remaining
// viewport.

const sButtonHeight = 180;

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'relative',
    minHeight: 480,
    [onlyS]: {
      minHeight: 320,
    },
    maxHeight: 800,
    height: `calc(100vh - ${headerHeight.s}px + ${sButtonHeight}px)`,
    paddingBottom: sButtonHeight,
    [mUp]: {
      paddingBottom: 0,
      height: `calc(100vh - ${headerHeight.mUp}px)`,
    },

    backgroundColor: link,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundImage: `url(${coverImage})`,

    display: 'flex',
    alignItems: 'center',

    color: white,
    marginBottom: 40,
  },
  bannerTitle: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    ...serifRegular40,
    [mUp]: {...serifRegular72},
    [xlUp]: {...serifRegular94}
  },
  content: {
    width: '100%',
    textAlign: 'center',
    zIndex: 1
  },
  arrow: {
    ...bounceDownAnimation(),

    position: 'fixed',
    bottom: 10,
    left: 'calc(50% - 16px)',
    zIndex: 1,

    transition: 'opacity .22s',
    opacity: 0,
    [onlyS]: {
      position: 'absolute',
      bottom: sButtonHeight
    }
  },
  shadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundImage: 'linear-gradient(-180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.50) 100%)'
  },
  buttonContainer: {
    [onlyS]: {
      position: 'absolute',
      left: 20,
      right: 20,
      bottom: 20
    }
  },
  button: {
    ...blendedPrimaryButtonStyleObject(white, darkGrey),
    margin: 8,
    minWidth: 180,

    [onlyS]: {
      display: 'block',
      margin: '16px 0px',
    }
  },
  link: {
    ...linkBaseStyle,
    ...sansBold15,

    display: 'block',
    marginTop: 15,

    ':hover': {
      textDecoration: 'underline'
    }
  }
});

export class Banner extends Component {
  constructor(props) {
    super(props);

    this.state = {showArrow: false};
    this.ref = ref => {
      this.rootRef = ref;
      this.measure();
    };
    this.measure = () => {
      if (this.rootRef) {
        const viewportHeight = window.innerHeight;
        const {bottom} = this.rootRef.getBoundingClientRect();
        this.setState({showArrow: bottom >= viewportHeight});
      }
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.measure, passiveEvent());
    window.addEventListener('resize', this.measure);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.measure);
    window.removeEventListener('resize', this.measure);
  }

  render() {
    const {t} = this.props;

    // We assume (or more precisely, require), that the title-with-line-break.
    // actually has a line break.
    const [p1, p2] = t('title-with-line-break').split('/');

    return (
      <div ref={this.ref} className={css(styles.bannerContainer)}>
        <div className={css(styles.shadow)} />

        <div className={css(styles.content)}>
          <NarrowContainer>
            <h1 className={css(styles.bannerTitle)}>{p1}<br/>{p2}</h1>
            <div className={css(styles.buttonContainer)}>
              <Link t={t} className={css(styles.button)} href={t('route/report-01')}>{t('landing-page/cover/read-report')}</Link>
              <Link t={t} className={css(styles.button)} href={t('route/dashboard')}>{t('landing-page/cover/view-indicators')}</Link>
              <Link t={t} className={css(styles.link)} target='_blank' href={t('share/report/href')}>{t('landing-page/cover/pdf')}</Link>
            </div>
          </NarrowContainer>
        </div>

        <div className={css(styles.arrow)} style={{opacity: this.state.showArrow ? 1 : 0}}>
          <ChevronDownIcon16 color={white} />
        </div>
      </div>
    );
  }
}

Banner.propTypes = {
  t: PropTypes.func.isRequired,
};
