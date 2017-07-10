import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet, css} from 'aphrodite';

import {text} from 'theme/constants';
import {BundesSerifRegular} from 'theme/fonts';
import {serifRegular36, serifRegular30, serifRegular26, serifRegular22, serifRegular20, sansBold20, sansBold18} from 'theme/typeface';
import {m, l} from 'theme/mediaQueries';


const styles = StyleSheet.create({
  heading: {
    color: text,
    fontFamily: BundesSerifRegular,
    marginBottom: 18,
    ':first-child': {
      marginTop: 0
    }
  },
  h1: {
    ...serifRegular26,
    [m]: serifRegular30,
    [l]: serifRegular36,
  },
  h2: {
    ...serifRegular20,
    marginTop: 50, // 2x lineHeight

    [m]: {
      ...serifRegular22,
      marginTop: 55, // 2x lineHeight
    },
    [l]: {
      ...serifRegular26,
      marginTop: 65, // 2x lineHeight
    },
  },
  h3: {
    ...serifRegular20,
    marginTop: 50 // 2x lineHeight
  },
  h4: {
    ...sansBold20,
    marginTop: 50 // 2x lineHeight
  },
  h5: {
    ...sansBold18
  },
  h6: {
    ...sansBold18
  }
});

const Heading = ({level, additionalStyles, ...restProps}) => {
  const HeadingTag = `h${level}`;
  return (
    <HeadingTag
      className={css(additionalStyles, styles.heading, styles[HeadingTag])}
      role='heading'
      aria-level={level}
      {...restProps}
    />
  );
};

Heading.propTypes = {
  children: PropTypes.node.isRequired,
  level: PropTypes.number.isRequired,
  additionalStyles: PropTypes.object
};

export default Heading;
