import React, {PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';

import {sansBold12} from 'theme/typeface';
import {link, white} from 'theme/constants';

const styles = StyleSheet.create({
  footnoteReference: {
    ...sansBold12,
    background: link,
    borderRadius: 8,
    color: white,
    display: 'inline-block',
    lineHeight: '16px',
    width: 16,
    height: 16,
    textAlign: 'center',
    textDecoration: 'none',
    marginLeft: '0.2em',
    verticalAlign: 'text-top',
    position: 'relative'
  },
  jumpTarget: {
    position: 'absolute',
    top: -100,
    visibility: 'hidden'
  }
});


const FootnoteReference = ({identifier}) => (
  <a
    className={css(styles.footnoteReference)}
    href={`#fn-${identifier}`}
    aria-describedby='footnote-definitions'
  >
    <span className={css(styles.jumpTarget)} id={`fn-ref-${identifier}`} />
    {identifier}
  </a>
);

FootnoteReference.propTypes = {
  identifier: PropTypes.string.isRequired
};

export default FootnoteReference;
