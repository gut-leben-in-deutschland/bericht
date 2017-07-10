import PropTypes from 'prop-types';
import React from 'react';
import {darkGrey} from 'theme/constants';

// -----------------------------------------------------------------------------
// ChevronDown (12, 16, 18)

export const ChevronDownIcon12 = ({color}) => (
  <svg width='12' height='7' viewBox='0 0 12 7'>
    <path d='M1,1l5,5,5,-5' strokeWidth='2' stroke={color} fill='none' fillRule='evenodd' />
  </svg>
);

ChevronDownIcon12.propTypes = {
  color: PropTypes.string.isRequired,
};

export const ChevronDownIcon16 = ({color}) => (
  <svg width='16' height='9' viewBox='0 0 16 9'>
    <path d='M1,1l7,7,7,-7' strokeWidth='2' stroke={color} fill='none' fillRule='evenodd' />
  </svg>
);

ChevronDownIcon16.propTypes = {
  color: PropTypes.string.isRequired
};

export const ChevronDownIcon18 = ({color}) => (
  <svg width='18' height='10' viewBox='0 0 18 10'>
    <path d='M1 1l8 8 8-8' strokeWidth='2' stroke={color} fill='none' fillRule='evenodd' />
  </svg>
);

ChevronDownIcon18.propTypes = {
  color: PropTypes.string.isRequired
};


// -----------------------------------------------------------------------------
// ChevronUp (12)

export const ChevronUpIcon12 = ({color}) => (
  <svg width='12' height='7' viewBox='0 0 12 7'>
    <path d='M1,6l5,-5,5,5' strokeWidth='2' stroke={color} fill='none' fillRule='evenodd' />
  </svg>
);

ChevronUpIcon12.propTypes = {
  color: PropTypes.string.isRequired,
};


// -----------------------------------------------------------------------------
// ChevronRight (12, 18)

export const ChevronRightIcon12 = ({color}) => (
  <svg width='7' height='12' viewBox='0 0 7 12'>
    <path d='M1,1l5,5,-5,5' strokeWidth='2' stroke={color} fill='none' fillRule='evenodd' />
  </svg>
);

ChevronRightIcon12.propTypes = {
  color: PropTypes.string.isRequired
};

export const ChevronRightIcon16 = ({color}) => (
  <svg width='16' height='16' viewBox='0 0 16 16'>
    <path d='M5 2l6 6-6 6' strokeWidth='2' stroke={color} fill='none' fillRule='evenodd'/>
  </svg>
);

ChevronRightIcon16.propTypes = {
  color: PropTypes.string.isRequired
};

export const ChevronRightIcon18 = ({color}) => (
  <svg width='10' height='18' viewBox='0 0 10 18'>
    <path d='M1,1l8,8,-8,8' strokeWidth='2' stroke={color} fill='none' fillRule='evenodd' />
  </svg>
);

ChevronRightIcon18.propTypes = {
  color: PropTypes.string.isRequired
};


// -----------------------------------------------------------------------------
// ChevronLeft (12, 18)

export const ChevronLeftIcon12 = ({color}) => (
  <svg width='7' height='12' viewBox='0 0 7 12'>
    <path d='M6,1l-5,5,5,5' strokeWidth='2' stroke={color} fill='none' fillRule='evenodd' />
  </svg>
);

ChevronLeftIcon12.propTypes = {
  color: PropTypes.string.isRequired
};

export const ChevronLeftIcon18 = ({color}) => (
  <svg width='10' height='18' viewBox='0 0 10 18'>
    <path d='M9,1l-8,8,8,8' strokeWidth='2' stroke={color} fill='none' fillRule='evenodd' />
  </svg>
);

ChevronLeftIcon18.propTypes = {
  color: PropTypes.string.isRequired
};

// -----------------------------------------------------------------------------
// Download

export const DownloadIcon = ({color, ...rest}) => (
  <svg width='14' height='16' viewBox='0 0 14 16' {...rest}>
    <g fill='none' fillRule='evenodd'>
      <path d='M7 0v12M12.883 6L6.92 12.017 1 6' stroke={color} strokeWidth='2'/>
      <path fill={color} d='M0 14h14v2H0z'/>
    </g>
  </svg>
);

DownloadIcon.propTypes = {
  color: PropTypes.string.isRequired
};
DownloadIcon.defaultProps = {
  color: darkGrey
};


// -----------------------------------------------------------------------------
// External


export const ExternalIcon = ({color, ...rest}) => (
  <svg width='16' height='16' viewBox='0 0 16 16' {...rest}>
    <g fill='none' fillRule='evenodd'>
      <path fill={color} d='M3 3h10v2H3z'/>
      <path fill={color} d='M11 3h2v10h-2z'/>
      <path d='M11.5 4.5l-7 7' stroke={color} strokeWidth='2' strokeLinecap='square'/>
    </g>
  </svg>
);

ExternalIcon.propTypes = {
  color: PropTypes.string.isRequired
};

// -----------------------------------------------------------------------------
// Close (12)

export const CloseIcon12 = ({color}) => (
  <svg width='12' height='12' viewBox='0 0 12 12'>
    <g stroke={color} fill='none' fillRule='evenodd' strokeWidth='2'>
      <path d='M1 1l10 10' />
      <path d='M11 1l-10 10' />
    </g>
  </svg>
);

CloseIcon12.propTypes = {
  color: PropTypes.string.isRequired
};
