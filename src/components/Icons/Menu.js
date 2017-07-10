import PropTypes from 'prop-types';
import React from 'react';
import {text} from 'theme/constants';

const Icon = ({size}) => (
  <svg width={size} height={size} viewBox='0 0 12 12'>
    <title>Menu</title>
    <g stroke='none' strokeWidth='1' fill={text} fillRule='evenodd'>
      <rect x='0' y='0' width='12' height='2'></rect>
      <rect x='0' y='5' width='12' height='2'></rect>
      <rect x='0' y='10' width='12' height='2'></rect>
    </g>
  </svg>
);

Icon.propTypes = {
  size: PropTypes.number.isRequired
};

Icon.defaultProps = {
  size: 12
};

export default Icon;
