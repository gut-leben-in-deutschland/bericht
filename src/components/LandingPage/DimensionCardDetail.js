import React, {Component, PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';

import {DesktopDetailView} from 'components/LandingPage/Desktop/DesktopDetailView';
import {MobileDetailView} from 'components/LandingPage/Mobile/MobileDetailView';
import {createMediaQuery} from 'theme/mediaQueries';

const maxWidth = 400;
const maxHeight = 480;
const minDesktopVisWidth = 1024;

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed',
    display: 'flex',
    top: 0,
    left: 0,
    bottom: 0,
    width: '100vw',
    backgroundColor: 'rgba(255,255,255,.75)',
    cursor: 'pointer',

    zIndex: 10,
    [createMediaQuery(minDesktopVisWidth, Infinity)]: {
      backgroundColor: 'transparent',
      position: 'absolute',
    },
  },
});

export class DimensionCardDetail extends Component {
  render() {
    const {viewportWidth, viewportHeight, onClose} = this.props;

    if (viewportWidth > maxWidth && viewportHeight > maxHeight) {
      return (
        <div className={css(styles.overlay)} onClick={onClose}>
        <DesktopDetailView {...this.props} />
        </div>
      );
    }

    return <MobileDetailView {...this.props} />;
  }
}

DimensionCardDetail.propTypes = {
  t: PropTypes.func.isRequired,

  dimensions: PropTypes.array.isRequired,
  dimensionId: PropTypes.string.isRequired,

  // Depending on the viewport, we either cover the whole viewport,
  // or show the detail card centered and a slightly transparent overlay
  // to cover the page content.
  viewportWidth: PropTypes.number.isRequired,
  viewportHeight: PropTypes.number.isRequired,

  gotoNext: PropTypes.func.isRequired,
  gotoPrevious: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
