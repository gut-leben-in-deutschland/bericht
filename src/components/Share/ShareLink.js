import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet, css} from 'aphrodite';
import {sansRegular14, sansBold16} from 'theme/typeface';
import {text} from 'theme/constants';
import {onlyS} from 'theme/mediaQueries';
import Link from 'components/ButtonLink/Link';

const icons = {
  facebook: require('./icons/facebook.icon.svg'),
  twitter: require('./icons/twitter.icon.svg'),
  email: require('./icons/email.icon.svg'),
  download: require('./icons/download.icon.svg'),
  github: require('./icons/github.icon.svg'),
};

const styles = StyleSheet.create({
  link: {
    cursor: 'pointer',
    display: 'inline-block',
    textDecoration: 'none'
  },
  icon: {
    display: 'inline-block',
    verticalAlign: 'top'
  },
  labels: {
    color: text,
    display: 'inline-block',
    marginLeft: 10,
    marginTop: 4,
    textAlign: 'left',
    [onlyS]: {
      display: 'none'
    }
  },
  subLabel: {
    ...sansRegular14,
    lineHeight: '16px', // line-height OK
    display: 'block'
  },
  label: {
    ...sansBold16,
    lineHeight: '16px', // line-height OK
    display: 'block'
  }
});

const ShareLink = ({icon, subLabel, label, href, targetBlank, title, ...rest}) => {
  const Icon = icons[icon];
  return (
    <Link className={css(styles.link)} href={href} target={targetBlank ? '_blank' : null} title={title} {...rest}>
      <Icon className={css(styles.icon)} />
      <span className={css(styles.labels)}>
        <span className={css(styles.subLabel)}>{subLabel}</span>
        <span className={css(styles.label)}>{label}</span>
      </span>
    </Link>
  );
};

ShareLink.propTypes = {
  icon: PropTypes.oneOf(Object.keys(icons)).isRequired,
  subLabel: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  targetBlank: PropTypes.bool,
};

export default ShareLink;
