import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet, css} from 'aphrodite';
import {Link} from 'react-router';

import {CONTENT_PADDING, CONTENT_MAX_WIDTH} from 'components/Grid/Grid';

import {sansRegular14, sansBold18} from 'theme/typeface';
import {text, softGrey, white} from 'theme/constants';
import {s, m, onlyM, l} from 'theme/mediaQueries';


const styles = StyleSheet.create({
  root: {
    borderTop: `1px solid ${softGrey}`,
    backgroundColor: white
  },
  innerContainer: {
    display: 'flex',
    flexDirection: 'row',

    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    margin: '0 auto',

    overflow: 'hidden',
  },

  link: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    color: text,

    // react-router Link reset / overrides
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'transform .12s',
    transform: 'translateX(0)',

    [s]: {
      padding: '32px 0'
    },
    [onlyM]: {
      padding: '52px 0'
    },
    [l]: {
      padding: '68px 0'
    }
  },
  prevLink: {
    // Make the prev-link slightly larger than the bare minimum to ensure the
    // clickable area is large enough.
    flexGrow: 0.3,

    ':hover': {
      transform: 'translateX(-6px)',
    },

    [m]: {
      flexGrow: 1
    },
  },
  nextLink: {
    ':hover': {
      transform: 'translateX(6px)',
    },
  },

  separator: {
    display: 'none',
    width: 1,
    backgroundColor: softGrey,

    [m]: {
      display: 'block',
      margin: '32px 0'
    },
    [l]: {
      margin: '40px 0'
    }
  },

  icon: {
    // The prev/next icons have different margin on the left/right side. But
    // always at least 'CONTENT_PADDING' towards the outer edge.
  },
  prevIcon: {
    margin: `0 16px 0 ${CONTENT_PADDING}px`,

    [m]: {
      margin: `0 24px 0 ${CONTENT_PADDING + 12}px`
    },
    [l]: {
      margin: `0 32px 0 ${CONTENT_PADDING + 40}px`
    }
  },
  nextIcon: {
    margin: `0 ${CONTENT_PADDING}px 0 16px`,

    [m]: {
      margin: `0 ${CONTENT_PADDING + 12}px 0 24px`
    },
    [l]: {
      margin: `0 ${CONTENT_PADDING + 40}px 0 32px`
    }
  },

  labels: {
    flexGrow: 1,
    flexBasis: '0%',
    display: 'flex',
    flexDirection: 'column'
  },
  prevLinkLabels: {
    textAlign: 'left',
    justifyContent: 'flex-start',

    display: 'none',
    [m]: {
      display: 'flex',
      marginRight: '20%'
    },
    [l]: {
      marginRight: '30%'
    }
  },
  nextLinkLabels: {
    textAlign: 'right',
    justifyContent: 'flex-end',

    [s]: {
      marginLeft: '10%'
    },
    [m]: {
      marginLeft: '20%'
    },
    [l]: {
      marginLeft: '30%'
    }
  },

  subTitle: {
    ...sansRegular14,
  },
  title: {
    ...sansBold18,
  }
});


export function BottomNavBar({prev, next}) {
  return (
    <div className={css(styles.root)}>
      <div className={css(styles.innerContainer)}>
        {prev !== undefined &&
        <Link to={prev.to} className={css(styles.link, styles.prevLink)}>
          <div className={css(styles.icon, styles.prevIcon)}>{prev.icon}</div>
          <div className={css(styles.labels, styles.prevLinkLabels)}>
            <div className={css(styles.subTitle)}>{prev.subTitle}</div>
            <div className={css(styles.title)}>{prev.title}</div>
          </div>
        </Link>}
        {prev !== undefined && <div className={css(styles.separator)} />}
        <Link to={next.to} className={css(styles.link, styles.nextLink)}>
          <div className={css(styles.labels, styles.nextLinkLabels)}>
            <div className={css(styles.subTitle)}>{next.subTitle}</div>
            <div className={css(styles.title)}>{next.title}</div>
          </div>
          <div className={css(styles.icon, styles.nextIcon)}>{next.icon}</div>
        </Link>
      </div>
    </div>
  );
}

const linkType = PropTypes.shape({
  subTitle: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,

  // Passed directly to react-router <Link to={..} />
  to: PropTypes.string.isRequired,

  // You probably want either <ChevronLeftIcon18 /> or <ChevronRightIcon18 />.
  // The icon SHOULD have text color, because it's shown on white background.
  icon: PropTypes.node.isRequired,
});

BottomNavBar.propTypes = {
  prev: linkType,
  next: linkType.isRequired
};
