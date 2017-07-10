import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';

import {text, white} from 'theme/constants';
import {sansRegular16} from 'theme/typeface';


// How the tooltip div is placed relative to the target. Eg. 'top' means the
// tooltip is shown above the target, and the tip is pointing downwards.
const toolTipPlacements = [
  'top', 'bottom', 'left', 'right', 'center',
];
const tipPlacements = [
  'tipLeft', 'tipRight',
];

const styles = StyleSheet.create({
  root: {
    ...sansRegular16,

    position: 'absolute',
    pointerEvents: 'none',

    backgroundColor: text,
    color: white,
    padding: '4px 8px 4px',

    textAlign: 'center',
    maxWidth: 265,
  },

  ['top']: {
    marginTop: -10,
  },
  ['bottom']: {
    marginTop: 10,
  },
  ['left']: {
    marginLeft: -10,
  },
  ['right']: {
    marginLeft: 10,
  },
  ['center']: {
    margin: 0,
  },
});

const tipStyles = StyleSheet.create({
  root: {
    position: 'absolute',
    width: 0,
    height: 0,
  },

  ['top']: {
    borderTop: `8px solid ${text}`,
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    bottom: -8,
    left: '50%',
    marginLeft: -10,
  },
  ['bottom']: {
    borderBottom: `8px solid ${text}`,
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    top: -8,
    left: '50%',
    marginLeft: -10,
  },
  ['left']: {
    borderLeft: `8px solid ${text}`,
    borderTop: '6px solid transparent',
    borderBottom: '6px solid transparent',
    right: -6,
    top: '50%',
    marginTop: -5,
  },
  ['right']: {
    borderRight: `8px solid ${text}`,
    borderTop: '6px solid transparent',
    borderBottom: '6px solid transparent',
    left: -6,
    top: '50%',
    marginTop: -5,
  },

  ['tipLeft']: {
    left: 15,
  },
  ['tipRight']: {
    left: 'calc(100% - 15px)',
  },
});

const defaultPlacementPreferences = {
  preferTop: true,
};

function calculatePosition(windowInnerHeight, width, height, contextRect, boundingRect, {forceTop, preferTop, forceBottom, preferBottom} = defaultPlacementPreferences) {
  if (windowInnerHeight === undefined || width === undefined || height === undefined) {
    return {};
  }

  const hasOverlapTop = contextRect.top + boundingRect.top < height;
  const hasOverlapBottom = windowInnerHeight - contextRect.top -
    boundingRect.top - boundingRect.height < height;

  const hasOverlapLeft = boundingRect.left - (width / 2) <= 0;
  const hasOverlapRight = boundingRect.left - contextRect.left +
    width > contextRect.width;

  const wouldOverlapLeft = boundingRect.left - width <= 0;
  const wouldOverlapRight = boundingRect.left + boundingRect.width +
    width > contextRect.width;

  if (wouldOverlapRight && wouldOverlapLeft) {
    return {
      toolTipPlacement: 'center',
      left: (contextRect.width / 2) - (width / 2),
      top: hasOverlapTop ? boundingRect.top + boundingRect.height + 10 : boundingRect.top - height - 10,
    };
  } else if (hasOverlapLeft && (hasOverlapTop || preferBottom || forceBottom)) {
    return {
      toolTipPlacement: 'bottom',
      tipPlacement: 'tipLeft',
      left: boundingRect.left + boundingRect.width / 2 - 15,
      top: boundingRect.top + boundingRect.height,
    };
  } else if (hasOverlapRight && (hasOverlapTop || preferBottom || forceBottom)) {
    return {
      toolTipPlacement: 'bottom',
      tipPlacement: 'tipRight',
      left: boundingRect.left - width + 15 + boundingRect.width / 2,
      top: boundingRect.top + boundingRect.height,
    };
  } else if (hasOverlapTop) {
    return {
      toolTipPlacement: 'bottom',
      left: boundingRect.left - (width / 2) + (boundingRect.width / 2),
      top: boundingRect.top + boundingRect.height,
    };
  } else if (hasOverlapLeft && (preferTop || forceTop)) {
    return {
      toolTipPlacement: 'top',
      tipPlacement: 'tipLeft',
      left: boundingRect.left + boundingRect.width / 2 - 15,
      top: boundingRect.top - height,
    };
  } else if (hasOverlapLeft) {
    return {
      toolTipPlacement: 'right',
      left: boundingRect.left + boundingRect.width,
      top: boundingRect.top + (boundingRect.height / 2) - (height / 2),
    };
  } else if (hasOverlapRight && (preferTop || forceTop)) {
    return {
      toolTipPlacement: 'top',
      tipPlacement: 'tipRight',
      left: boundingRect.left - width + 15 + boundingRect.width / 2,
      top: boundingRect.top - height,
    };
  } else if (hasOverlapRight) {
    return {
      toolTipPlacement: 'left',
      left: boundingRect.left - width,
      top: boundingRect.top + (boundingRect.height / 2) - (height / 2),
    };
  } else if (forceBottom && !hasOverlapBottom) {
    return {
      toolTipPlacement: 'bottom',
      left: boundingRect.left - (width / 2) + (boundingRect.width / 2),
      top: boundingRect.top + boundingRect.height,
    };
  }

  return {
    toolTipPlacement: 'top',
    left: boundingRect.left - (width / 2) + (boundingRect.width / 2),
    top: boundingRect.top - height,
  };
}

export class Tooltip extends Component {
  constructor(props) {
    super(props);

    this.state = {
      windowInnerHeight: undefined,
      width: undefined,
      height: undefined,
    };

    this.ref = undefined;
    this.measure = ref => {
      this.ref = ref;
      this.updateDimensions();
    };

    // Pre-generate all CSS styles so that we don't have any issues due to
    // the styles being injected asynchronously into the DOM.
    this.rootClassName();
    toolTipPlacements.forEach(toolTipPlacement => {
      this.rootClassName(toolTipPlacement);
      this.tipClassName(toolTipPlacement);
      tipPlacements.forEach(tipPlacement => {
        this.tipClassName(toolTipPlacement, tipPlacement);
      });
    });
  }

  componentDidMount() {
    this.updateDimensions();
  }

  componentDidUpdate() {
    this.updateDimensions();
  }

  componentWillUnmount() {
    clearTimeout(this.updateDimensionsTimeoutId);
  }

  updateDimensions() {
    this.updateDimensionsTimeoutId = setTimeout(() => {
      if (this.ref) {
        const {width, height} = this.ref.getBoundingClientRect();
        if (this.state.width !== width || this.state.height !== height) {
          this.setState({windowInnerHeight: window.innerHeight, width, height}); // eslint-disable-line
        }
      }
    });
  }

  rootClassName(toolTipPlacement) {
    return css(styles.root, styles[toolTipPlacement]);
  }
  tipClassName(toolTipPlacement, tipPlacement) {
    return css(tipStyles.root, tipStyles[toolTipPlacement], tipStyles[tipPlacement]);
  }

  render() {
    const {windowInnerHeight, width, height} = this.state;
    const {boundingRect, contextRect, zIndex, placementPreferences} = this.props;

    const {toolTipPlacement, tipPlacement, top, left} =
      calculatePosition(windowInnerHeight, width, height, contextRect,
        boundingRect, placementPreferences);

    const style = top !== undefined && left !== undefined
      ? {top, left, zIndex}
      : {opacity: 0};

    return (
      <div ref={this.measure} className={this.rootClassName(toolTipPlacement)} style={style}>
        <div className={this.tipClassName(toolTipPlacement, tipPlacement)} />
        {this.props.children}
      </div>
    );
  }
}

Tooltip.propTypes = {
  children: PropTypes.node,
  boundingRect: PropTypes.shape({
    left: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  contextRect: PropTypes.shape({
    left: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
  }).isRequired,
  zIndex: PropTypes.number,
  placementPreferences: PropTypes.shape({
    forceTop: PropTypes.bool,
    preferTop: PropTypes.bool,
    forceBottom: PropTypes.bool,
    preferBottom: PropTypes.bool,
  }),
};
