import PropTypes from 'prop-types';
import React from 'react';
import {css} from 'aphrodite';

import styles from './Styles.js';

const Button = ({primary, link, disabled, large, small, className, onClick, children}) => {
  let style = [styles.base];
  if (link) {
    style.push(styles.link);
  } else if (primary) {
    style.push(styles.primary);
  } else {
    style.push(styles.button);
  }
  if (small) {
    style.push(styles.small);
  }
  if (large) {
    style.push(styles.large);
  }

  return (
    <button
      className={className || css(...style)}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  primary: PropTypes.bool,
  link: PropTypes.bool,
  large: PropTypes.bool,
  small: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

Button.defaultProps = {
  primary: false,
  link: false,
  large: false,
  small: false,
  disabled: false
};

export default Button;
