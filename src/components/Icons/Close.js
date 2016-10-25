import React, {PropTypes} from 'react';
import {text} from 'theme/constants';

const Icon = ({size}) => (
  <svg width={size} height={size} viewBox='0 0 12 12'>
    <title>Close</title>
    <g stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
      <g transform='translate(-288.000000, -100.000000)' fill={text}>
        <path d='M294.010408,104.596194 L289.414214,100 L288,101.414214 L292.596194,106.010408 L288,110.606602 L289.414214,112.020815 L294.010408,107.424621 L298.606602,112.020815 L300.020815,110.606602 L295.424621,106.010408 L300.020815,101.414214 L298.606602,100 L294.010408,104.596194 Z'></path>
      </g>
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
