import PropTypes from 'prop-types';
import React from 'react';

export const CabinetLoading = () => (
  <span
    style={{
      display: 'inline-block',
      padding: 8,
      margin: 4,
      background: '#EBEBEB',
      color: '#333',
      fontSize: 12,
      borderRadius: 3
    }}
  >
    Loading content …
  </span>
);

export const CabinetLoadingError = ({errors}) => (
  <div
    style={{
      padding: 8,
      margin: 4,
      background: '#FF5555',
      color: '#FFFFFF',
      fontSize: 12,
      borderRadius: 3}}
  >
    Loading failed!

    <ul>
      {errors.map((error, i) => (
        <li key={i}>{error}</li>
      ))}
    </ul>
  </div>
);

CabinetLoadingError.propTypes = {
  errors: PropTypes.array.isRequired
};

export const CabinetBar = ({action, isConnected}) => (
  <div
    className='CabinetBar'
    style={{
      background: isConnected ? '#2FBF62' : '#666666',
      borderRadius: 3,
      color: '#FFF',
      fontSize: 12,
      position: 'absolute',
      top: 90,
      right: 183,
      padding: '4px 8px',
      zIndex: 99999
    }}
  >
    {isConnected ? 'Connected to GitHub' : 'Not connected to GitHub'}
    <button
      onClick={action}
      style={{
        background: 'transparent',
        border: 'none',
        color: '#FFF',
        cursor: 'pointer',
        fontSize: 12,
        textDecoration: 'underline'
      }}
    >
      {isConnected ? 'log out' : 'log in'}
    </button>
  </div>
);

CabinetBar.propTypes = {
  action: PropTypes.func.isRequired,
  isConnected: PropTypes.bool
};
