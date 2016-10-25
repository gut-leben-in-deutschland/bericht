import React, {PropTypes} from 'react';
import {withCabinet} from 'cabinet';
import {StyleSheet, css} from 'aphrodite';
import Link from 'components/ButtonLink/Link';

import {Container} from 'components/Grid/Grid';

import {softGrey, darkGrey, white, marginM} from 'theme/constants';
import {BundesSansRegular, BundesSansBold} from 'theme/fonts';
import {flexContainer, textLink} from 'theme/helpers';
import {m} from 'theme/mediaQueries';


// The margin between the links
const linkMargin = 12;

const styles = StyleSheet.create({
  footer: {
    padding: '16px 0',

    background: darkGrey,
    color: white,

    [m]: {
      padding: '28px 0'
    }
  },
  footerContent: {
    ...flexContainer({center: 'both', space: 'between'}),
    flexDirection: 'column',

    [m]: {
      flexDirection: 'row-reverse'
    }
  },
  copyright: {
    textAlign: 'center',
    fontFamily: BundesSansRegular,
    fontSize: 14,

    [m]: {
      textAlign: 'left',
      marginRight: marginM,
    },
  },
  links: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',

    fontFamily: BundesSansBold,
    fontSize: 14,

    padding: 0,
    margin: `0 -${linkMargin}px 12px`,

    [m]: {
      margin: `0 -${linkMargin}px`,
      justifyContent: 'flex-end',
    }
  },
  item: {
    display: 'inline-block',
    listStyle: 'none',

    marginBottom: 12,
    [m]: {
      marginBottom: 0
    },
  },
  link: {
    ...textLink,
    padding: 0,
    margin: `0 ${linkMargin}px`,

    color: white,
    whiteSpace: 'nowrap',

    ':hover': {
      color: softGrey
    },
  }
});

const Footer = ({cabinet: {t}}) => (
  <div className={css(styles.footer)}>
    <Container>
      <div className={css(styles.footerContent)}>
        <ul className={css(styles.links)}>
          <li className={css(styles.item)}><Link className={css(styles.link)} t={t} href={t('link/newsletter/url')}>{t('link/newsletter/label')}</Link></li>
          <li className={css(styles.item)}><Link className={css(styles.link)} t={t} href={t('route/impressum')}>{t('imprint')}</Link></li>
          <li className={css(styles.item)}><Link className={css(styles.link)} t={t} href={t('route/datenschutz')}>{t('privacy')}</Link></li>
          <li className={css(styles.item)}><Link className={css(styles.link)} t={t} href={t('link/data-on-github/url')}>{t('link/data-on-github/label')}</Link></li>
        </ul>
        <div className={css(styles.copyright)}>
          © {t('footer/copyright-year')} {t('footer/copyright-owner')}
        </div>
      </div>
    </Container>
  </div>
);

Footer.propTypes = {
  cabinet: PropTypes.object.isRequired
};

export default withCabinet()(Footer);
