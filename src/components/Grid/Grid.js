import React, {PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {onlyS, m as mUp} from 'theme/mediaQueries';

export const GUTTER = 20;
export const CONTENT_PADDING = 20;

export const NARROW_CONTENT_MAX_WIDTH = 650;
export const MEDIUM_CONTENT_MAX_WIDTH = 1024;
export const CONTENT_MAX_WIDTH = 1440;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: `0 ${CONTENT_PADDING}px`,
    maxWidth: CONTENT_MAX_WIDTH,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  narrowContainer: {
    width: '100%',
    padding: `0 ${CONTENT_PADDING}px`,
    maxWidth: NARROW_CONTENT_MAX_WIDTH,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  mediumContainer: {
    width: '100%',
    padding: `0 ${CONTENT_PADDING}px`,
    maxWidth: MEDIUM_CONTENT_MAX_WIDTH,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  grid: {
    clear: 'both',
    overflow: 'auto',
    zoom: '1',
    marginLeft: `-${GUTTER / 2}px`,
    width: `calc(100% + ${GUTTER}px)`
  },
  span: {
    float: 'left',
    paddingLeft: `${GUTTER / 2}px`,
    paddingRight: `${GUTTER / 2}px`
  },
  s1of2: {[onlyS]: {width: '50%'}},
  s2of2: {[onlyS]: {width: '100%'}},
  m1of6: {[mUp]: {width: `${100 / 6 * 1}%`}},
  m2of6: {[mUp]: {width: `${100 / 6 * 2}%`}},
  m3of6: {[mUp]: {width: `${100 / 6 * 3}%`}},
  m4of6: {[mUp]: {width: `${100 / 6 * 4}%`}},
  m5of6: {[mUp]: {width: `${100 / 6 * 5}%`}},
  m6of6: {[mUp]: {width: `${100 / 6 * 6}%`}}
});

export const Container = ({children}) => (
  <div className={css(styles.container)}>
    {children}
  </div>
);

Container.propTypes = {
  children: PropTypes.node,
  className: PropTypes.any
};

export const NarrowContainer = ({children}) => (
  <div className={css(styles.narrowContainer)}>
    {children}
  </div>
);

NarrowContainer.propTypes = {
  children: PropTypes.node
};

export const MediumContainer = ({children}) => (
  <div className={css(styles.mediumContainer)}>
    {children}
  </div>
);

MediumContainer.propTypes = {
  children: PropTypes.node
};

export const Grid = ({children}) => (
  <div className={css(styles.grid)}>
    {children}
  </div>
);

Grid.propTypes = {
  children: PropTypes.node
};

const fractionToClassName = (frac = '') => frac.replace(/\//, 'of');

export const Span = ({children, s, m}) => {
  return (
    <CustomSpan extraStyles={[
      styles[`s${fractionToClassName(s)}`],
      styles[`m${fractionToClassName(m)}`]]
    }>{children}</CustomSpan>
  );
};

Span.propTypes = {
  children: PropTypes.node,
  s: PropTypes.oneOf(['1/2', '2/2']),
  m: PropTypes.oneOf(['1/6', '2/6', '3/6', '4/6', '5/6', '6/6'])
};


export const CustomSpan = ({children, extraStyles}) => {
  return (
    <div className={css(styles.span, ...extraStyles)}>{children}</div>
  );
};

CustomSpan.propTypes = {
  children: PropTypes.node.isRequired,
  extraStyles: PropTypes.array.isRequired
};
