import React, {PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {onlyS, m} from 'theme/mediaQueries';
import {text, midGrey, grey, link} from 'theme/constants';
import {sansRegular18, sansBold18, serifRegular18} from 'theme/typeface';
import Link from 'components/ButtonLink/Link';
import buttonStyles from 'components/ButtonLink/Styles';

const styles = StyleSheet.create({
  link: {
    [onlyS]: {
      display: 'block',
      padding: '15px 20px',
      textAlign: 'left'
    }
  },
  primaryLink: {
    ...sansRegular18,
    color: text,
    ':hover': {
      color: link,
    },
    ':focus': {
      color: link
    },
    ':active': {
      color: link,
      textDecoration: 'none'
    },
    ':disabled': {
      opacity: 0.6
    },
    [m]: {
      ...serifRegular18,
      ':active': {
        color: link,
        textDecoration: 'none'
      }
    }
  },
  metaLink: {
    ...sansRegular18,
    color: midGrey,
    ':hover': {
      color: link,
    },
    ':focus': {
      color: link
    },
    ':active': {
      color: link,
      textDecoration: 'none'
    },
    ':disabled': {
      opacity: 0.6
    },
    [m]: {
      textTransform: 'uppercase',
      fontSize: 12
    }
  },
  primaryLinkActive: {
    color: link,
    ...sansBold18,
    [m]: {
      ...serifRegular18
    }
  },
  separator: {
    paddingRight: 9,
    height: 9,
    marginTop: -7,
    display: 'inline-block',
    verticalAlign: 'middle',
    ':before': {
      content: "''",
      width: 1,
      height: 9,
      marginRight: 9,
      marginBottom: 5,
      backgroundColor: grey,
      display: 'inline-block'
    },
    [onlyS]: {
      display: 'none'
    }
  }
});

export const PrimaryLink = ({active, ...props}) => {
  const className = css(buttonStyles.base, buttonStyles.link, styles.link, styles.primaryLink);
  const activeClassName = css(
    buttonStyles.base, buttonStyles.link, styles.link, styles.primaryLink,
    styles.primaryLinkActive
  );
  return (
    <Link
      {...props}
      className={active ? activeClassName : className}
      activeClassName={activeClassName}
    />
  );
};

PrimaryLink.propTypes = {
  active: PropTypes.bool
};

export const MetaLink = (props) => (
  <Link
    {...props}
    className={css(buttonStyles.base, buttonStyles.link, styles.link, styles.metaLink)}
  />
);

export const MetaIcon = ({children}) => (
  <span className={css(styles.separator)}>{children}</span>
);

MetaIcon.propTypes = {
  children: PropTypes.element.isRequired
};
