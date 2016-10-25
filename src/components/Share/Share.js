import React, {PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {withCabinet} from 'cabinet';

import {routePublicURL} from 'components/PageHead';

import {flexContainer} from 'theme/helpers';
import {m} from 'theme/mediaQueries';

import ShareLink from './ShareLink';


const styles = StyleSheet.create({
  container: {
    ...flexContainer({center: 'horizontal'}),
    borderTop: '1px solid rgba(0,0,0,.1)',
    padding: `30px 0`
  },
  span: {
    padding: `0 12px`,
    [m]: {
      padding: `0 24px`
    }
  }
});

const ShareLinkSpan = (props) => (
  <div className={css(styles.span)}>
    <ShareLink
      {...props}
    />
  </div>
);

const Share = ({t, links}) => (
  <div className={css(styles.container)}>
    {links.map((link, i) => <ShareLinkSpan key={i} t={t} {...link} />)}
  </div>
);

Share.propTypes = {
  t: PropTypes.func.isRequired,
  links: PropTypes.array.isRequired
};


// -----------------------------------------------------------------------------
// Pre-baked share links for Facebook, Twitter, Email and CSV / Report download.
//
// The 'Facebook' and 'Twitter' labels are not localized, because they are
// company names.

function facebookShareLink(t, url) {
  return {
    targetBlank: true,
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: 'facebook',
    subLabel: t('share/facebook/sub-label'),
    label: 'Facebook', // Not localized
    title: t('share/facebook/title')
  };
}

function twitterShareLink(t, url) {
  const text = t('share/twitter/text');

  return {
    targetBlank: true,
    href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    icon: 'twitter',
    subLabel: t('share/twitter/sub-label'),
    label: 'Twitter', // Not localized
    title: t('share/twitter/title')
  };
}

function emailShareLink(t, url) {
  const subject = t('share/email/subject');
  const body = t('share/email/body').replace('{url}', url);

  return {
    href: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    icon: 'email',
    subLabel: t('share/email/sub-label'),
    label: t('share/email/label'),
    title: t('share/email/title')
  };
}

function dataShareLink(t) {
  return {
    href: t('link/data-on-github/url'),
    icon: 'github',
    subLabel: t('share/csv/sub-label'),
    label: t('share/csv/label'),
    title: t('share/csv/title')
  };
}

function reportShareLink(t) {
  return {
    href: t('share/report/href'),
    icon: 'download',
    subLabel: t('share/report/sub-label'),
    label: t('share/report/label'),
    title: t('share/report/title')
  };
}


// -----------------------------------------------------------------------------
// Standard 'Share' footer with links to social media and ability to share
// via email.

function _ShareFooter({cabinet: {t}, route}) {
  const url = routePublicURL(t, route);

  const links = [
    facebookShareLink(t, url),
    twitterShareLink(t, url),
    emailShareLink(t, url)
  ];

  return <Share t={t} links={links} />;
}

_ShareFooter.propTypes = {
  cabinet: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

export const ShareFooter = withCabinet()(_ShareFooter);


// -----------------------------------------------------------------------------
// Same as 'ShareFooter' but with additional item to the GitHub repository
// where the data is available.

function _ShareFooterData({cabinet: {t}, route}) {
  const url = routePublicURL(t, route);

  const links = [
    facebookShareLink(t, url),
    twitterShareLink(t, url),
    emailShareLink(t, url),
    dataShareLink(t)
  ];

  return <Share t={t} links={links} />;
}

_ShareFooterData.propTypes = {
  cabinet: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

export const ShareFooterData = withCabinet()(_ShareFooterData);


// -----------------------------------------------------------------------------
// Same as 'ShareFooter' but with additional item to download the PDF report.

function _ShareFooterReport({cabinet: {t}, route}) {
  const url = routePublicURL(t, route);

  const links = [
    facebookShareLink(t, url),
    twitterShareLink(t, url),
    emailShareLink(t, url),
    reportShareLink(t)
  ];

  return <Share t={t} links={links} />;
}

_ShareFooterReport.propTypes = {
  cabinet: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

export const ShareFooterReport = withCabinet()(_ShareFooterReport);
