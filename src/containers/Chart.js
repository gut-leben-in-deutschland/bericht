import PropTypes from 'prop-types';
import React from 'react';
import CabinetChart from 'components/Chart/CabinetChart';
import {StyleSheet, css} from 'aphrodite';

import {text, white} from 'theme/constants';
import {serifRegular20} from 'theme/typeface';

// Fix widths and pre-configure transform here to facilitate rendering at double resolution in phantomjs
// .chart-container need to be available to set a transform on

const styles = StyleSheet.create({
  container: {
    padding: '16px 48px 40px',
    marginTop: 1,
    backgroundColor: white,
    position: 'relative',
    transform: 'scale(1)',
    transformOrigin: '0 0'
  },
  // a hack for Twitter
  // https://twitter.com/pixel_dailies/status/705200381505048576
  // https://twitter.com/megaspel/status/737645671587713025
  transparentPixel: {
    position: 'absolute',
    top: -1,
    left: 1,
    width: '100%',
    height: 1,
    backgroundColor: white,
    boxShadow: '0 0 1px 1px rgba(255,255,255,0.9)'
  },
  title: {
    ...serifRegular20,
    color: text,
    marginBottom: 21
  },
  bg: {
    width: 640
  }
});

const ChartContainer = ({params: {id}}) => {
  return (
    <div className={css(styles.container) + ' chart-container'}>
      <div className={css(styles.bg)}>
        <div className={css(styles.transparentPixel)}></div>
        <CabinetChart id={id} config={{titleClassName: css(styles.title), copyright: true, width: 640}} />
      </div>
    </div>
  );
};

ChartContainer.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired
};

export default ChartContainer;
