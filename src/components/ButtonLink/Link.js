import PropTypes from 'prop-types';
import { createElement } from 'react';
import {Link as RouterLink} from 'react-router';
import {css} from 'aphrodite';

import styles from './Styles.js';

const externalLinkRe = /^(https?:)?\/\//;
const emailLinkRe = /^mailto:/;

export const isExternalHref = href =>
  !(typeof href === 'object') && externalLinkRe.test(href);

export const isEmailHref = href =>
  !(typeof href === 'object') && emailLinkRe.test(href);

export const Link = ({t, primary, button, large, small, target, href, children, className, title, ...props}) => {
  let style = [styles.base];
  if (button) {
    style.push(styles.button);
  } else if (primary) {
    style.push(styles.primary);
  } else {
    style.push(styles.link);
  }
  if (small) {
    style.push(styles.small);
  }
  if (large) {
    style.push(styles.large);
  }

  const isExternal = isExternalHref(href) || target === '_blank';
  const isEmail = isEmailHref(href);
  const type = (isExternal || isEmail) ? 'a' : RouterLink;
  const hrefProp = (isExternal || isEmail) ? 'href' : 'to';

  let linkTitle;

  if (target === '_blank') {
    linkTitle = `${title} (${t('link-title/target-blank')})`;
  } else if (isEmail) {
    linkTitle = `${title} (${t('link-title/email')})`;
  } else if (isExternal) {
    linkTitle = `${title} (${t('link-title/external')})`;
  } else {
    linkTitle = title;
  }

  return createElement(type, {
    ...props,
    className: className || css(...style),
    rel: isExternal ? 'external' : null,
    title: linkTitle,
    target,
    [hrefProp]: href
  }, children);
};

Link.propTypes = {
  t: PropTypes.func.isRequired,
  href: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  target: PropTypes.string,
  children: PropTypes.node.isRequired,
  primary: PropTypes.bool,
  button: PropTypes.bool,
  large: PropTypes.bool,
  small: PropTypes.bool,
  className: PropTypes.string,
  title: PropTypes.string
};

Link.defaultProps = {
  href: '',
  primary: false,
  button: false,
  large: false,
  small: false,
  disabled: false,
  title: ''
};

export default Link;


export function LinkInline({t, href, children, title}) {
  return createElement(Link, {t, title, href, className: css(styles.base, styles.link, styles.linkInline), children});
}

export function Link16({t, href, children}) {
  return createElement(Link, {t, href, className: css(styles.link16), children});
}

export function Link18({t, href, children}) {
  return createElement(Link, {t, href, className: css(styles.link18), children});
}
