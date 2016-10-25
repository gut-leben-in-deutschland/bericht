import React, {PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';

import {sansRegular12, sansBold12} from 'theme/typeface';
import {darkGrey} from 'theme/constants';

const styles = StyleSheet.create({
  container: {
    marginBottom: 10
  },
  inlineContainer: {
    marginBottom: 0,
    lineHeight: '12px'
  },
  title: {
    ...sansBold12,
    color: darkGrey
  },
  label: {
    ...sansRegular12,
    color: darkGrey
  },
  labelWithColor: {
    paddingLeft: 12,
    position: 'relative'
  },
  inlineLabel: {
    display: 'inline-block',
    marginRight: 12
  },
  color: {
    position: 'absolute',
    left: 0,
    top: 5,
    width: 8,
    height: 8
  },
  circle: {
    borderRadius: '50%',
  }
});

const ColorLegend = ({title, shape, values, maxWidth, inline}) => {
  if (!values.length && !title) {
    return null;
  }
  return (
    <div className={css(styles.container, inline && styles.inlineContainer)} style={{maxWidth}}>
      {!!title && <div className={css(styles.title)}>{title}</div>}
      {
        values.map((value, i) => {
          let text = value.label;

          return (
            <div key={i} className={css(styles.label, inline && styles.inlineLabel, !!value.color && styles.labelWithColor)}>
              {!!value.color && (
                <div
                  className={css(styles.color, styles[shape === 'square' ? 'square' : 'circle'])}
                  style={{backgroundColor: value.color}} />
              )}
              {text}{' '}
            </div>
          );
        })
      }
    </div>
  );
};

ColorLegend.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  shape: PropTypes.oneOf(['square', 'circle', 'marker']),
  values: PropTypes.arrayOf(PropTypes.shape({
    color: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired
  })),
  maxWidth: PropTypes.number,
  inline: PropTypes.bool
};

export default ColorLegend;
