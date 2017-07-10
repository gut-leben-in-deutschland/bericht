import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {withCabinet} from 'cabinet';
import Link from 'components/ButtonLink/Link';
import {CONTENT_MAX_WIDTH, CONTENT_PADDING} from 'components/Grid/Grid';
import Menu from './Menu';
import {StyleSheet, css} from 'aphrodite';

import campaignLogo from './ic_glid_big.svg';
import logoDe from './brandmark_government_de_l.svg';
import logoEn from './brandmark_government_en_l.svg';
import SignLanguageIcon from './SignLanguage.icon.svg';
import SimpleLanguageIcon from './SimpleLanguage.icon.svg';

import {m, onlyS} from 'theme/mediaQueries';
import {zIndexOverlay} from 'theme/zIndex';
import {darkGrey, softGrey} from 'theme/constants';
import {flexContainer} from 'theme/helpers';
import {dimensionColor} from 'utils/dimension';

const logos = {
  de: logoDe,
  en: logoEn
};

// The total header height under the different media queries. The height
// includes the top and bottom borders, which are 10 + 1 pixels wide.
export const headerHeight = {
  s: 128 + 10 + 1,
  mUp: 184 + 10 + 1,
};

const styles = StyleSheet.create({
  container: {
    background: 'white',
    borderTop: `10px solid ${darkGrey}`,
    borderBottom: `1px solid ${softGrey}`,
    position: 'relative',
  },
  innerContainer: {
    margin: '0 auto',
    maxWidth: CONTENT_MAX_WIDTH,
    height: 184,
    paddingTop: 10,
    position: 'relative',
    [onlyS]: {
      paddingTop: 0,
      height: 128
    }
  },
  menuContainer: {
    [m]: {
      ...flexContainer({direction: 'column'}),
      height: 154,
      position: 'absolute',
      top: 10,
      right: CONTENT_PADDING,
      width: '100%'
    },
    [onlyS]: {
      position: 'relative'
    }
  },
  expandedMenuContainer: {
    zIndex: zIndexOverlay,
  },
  logoContainer: {
    position: 'absolute',
    left: CONTENT_PADDING,
    right: CONTENT_PADDING,
    [m]: {
      bottom: 52,
      zIndex: 5
    },
    [onlyS]: {
      bottom: 24,
    }
  },
  titleContainer: {
    position: 'absolute',
    bottom: 74,
    right: CONTENT_PADDING,
    [onlyS]: {
      bottom: 44,
    }
  },
  logo: {
    maxWidth: '100%',
    float: 'left',
    [onlyS]: {
      height: 56,
    }
  },
  campaignLogo: {
    float: 'right',
    [onlyS]: {
      height: 56,
    }
  }
});

class Header extends Component {
  constructor(props) {
    super(props);
    this.toggleList = this.toggleList.bind(this);
    this.state = {expanded: false};
  }
  toggleList() {
    this.setState({expanded: !this.state.expanded});
  }
  render() {
    const {routeKey, cabinet: {t, locale, locales}, dimensionId, section} = this.props;

    const alternates = locales
      .filter(l => l !== locale)
      .map(l => ({
        path: t.locale(l)(routeKey),
        locale: l
      }));

    const metaLinks = [
      ...alternates.map((route) => ({
        href: route.path,
        lang: route.locale,
        label: t(`header/${route.locale}`)
      })),
      {
        href: t('link/government/url'),
        label: t('link/government/label')
      },
      {
        href: t('route/contact'),
        label: t('header/contact')
      },
      locale !== 'en' && {
        href: t('link/sign-language/url'),
        label: t('link/sign-language/label'),
        icon: <SignLanguageIcon />
      },
      locale !== 'en' && {href:
        t('link/simple-language/url'),
        label: t('link/simple-language/label'),
        icon: <SimpleLanguageIcon />
      }
    ].filter(Boolean);

    const primaryLinks = [
      {
        href: t('route/index'),
        label: t('header/report'),
        active: section === 'report'},
      {
        href: t('route/dashboard'),
        label: t('header/dashboard'),
        active: section === 'indicators'
      },
      {
        href: t('route/about'),
        label: t('header/about')
      },
    ];

    const ribbonColor = this.props.ribbonColor ||
      (dimensionId ? dimensionColor(dimensionId) : darkGrey);

    return (
      <div className={css(styles.container)} style={{borderTopColor: ribbonColor}}>
        <div className={css(styles.innerContainer)}>
          <div className={css(styles.logoContainer)}>
            <Link href={t('route/index')} t={t} style={{width: '100%'}} title={t('header/home-link-title')}>
              <img className={css(styles.logo)} src={logos[locale] || logos.de} alt={t('header/logo/alt')} />
              <img className={css(styles.campaignLogo)} src={campaignLogo} alt={t('header/campaign-logo/alt')} />
            </Link>
          </div>
          <div className={css(styles.menuContainer, this.state.expanded && styles.expandedMenuContainer)}>
            <Menu
              t={t}
              height={154}
              meta={metaLinks}
              primary={primaryLinks}
              expanded={this.state.expanded}
              toggle={this.toggleList}
              label={t('header/menu')}
            />
          </div>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  routeKey: PropTypes.string.isRequired,
  cabinet: PropTypes.object.isRequired,
  ribbonColor: PropTypes.string,
  dimensionId: PropTypes.string,
  section: PropTypes.oneOf(['report', 'indicators'])
};

export default withCabinet()(Header);
