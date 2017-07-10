import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet, css} from 'aphrodite';
import {Link, isExternalHref} from 'components/ButtonLink/Link';

import {ChevronRightIcon16, DownloadIcon, ExternalIcon} from 'components/Icons/Icons';
import buttonStyles from 'components/ButtonLink/Styles';

import {link} from 'theme/constants';


const borderColor = 'rgba(0,0,0,0.1)';

const styles = StyleSheet.create({
  item: {
    borderBottom: `1px solid ${borderColor}`,
  },
  firstItem: {
    borderTop: `1px solid ${borderColor}`,
  },

  fenceLink: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    lineHeight: '24px',
    padding: '11px 0',

    // XXX: buttonStyles.link16 sets text-align:left.
    textAlign: 'left'
  },
  fenceLinkIcon: {
    flexShrink: 0,
    margin: '4px 8px 0 20px',
    lineHeight: '16px'
  },
});

export function FencedItemList({items}) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className={css(styles.item, index === 0 && styles.firstItem)}>
          {item}
        </div>
      ))}
    </div>
  );
}

FencedItemList.propTypes = {
  items: PropTypes.array.isRequired,
};

const icons = {
  external: <ExternalIcon color={link} />,
  chevron: <ChevronRightIcon16 color={link} />,
  download: <DownloadIcon color={link} />
};

export function FenceLink({t, to, title, children, target, icon}) {
  const autoIcon = icon || (isExternalHref(to) ? 'external' : 'chevron');
  const iconElement = autoIcon && (
    <div className={css(styles.fenceLinkIcon)}>{icons[autoIcon]}</div>
  );

  return (
    <Link className={css(buttonStyles.link16, styles.fenceLink)} t={t} href={to} target={target} title={title}>
      {children} {iconElement}
    </Link>
  );
}

FenceLink.propTypes = {
  t: PropTypes.func.isRequired,
  to: PropTypes.any.isRequired, // Same type as react-router <Link to={...} />.
  title: PropTypes.string,
  target: PropTypes.string,
  icon: PropTypes.oneOf(Object.keys(icons)),
  children: PropTypes.node.isRequired
};
