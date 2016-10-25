import React, {PropTypes, Component} from 'react';
import {StyleSheet, css} from 'aphrodite';

import {scrollY} from 'utils/dom';
import {shallowEqual} from 'utils/shallowEqual';

const HORIZONTAL_PADDING = 16;

const styles = StyleSheet.create({
  scrollBlock: {
    position: 'relative',
    marginLeft: -HORIZONTAL_PADDING,
    transition: 'opacity .6s',
    opacity: 1,
  },
  scrollBlockContent: {
    backgroundColor: `rgba(255,255,255,.9)`,
    padding: `20px ${HORIZONTAL_PADDING}px`,
    borderRadius: 4,
  }
});

class ScrollBlock extends Component {
  constructor(props) {
    super(props);

    this.onRef = ref => {
      this.ref = ref;
    };
  }
  componentDidMount() {
    this.props.requestMeasure();
  }
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }
  measure() {
    if (!this.ref) {
      return null;
    }
    const {top, height} = this.ref.getBoundingClientRect();

    return {
      top: scrollY() + top,
      height
    };
  }
  render() {
    const {isActive, children, width, marginBottom, isInterleaved} = this.props;

    if (isInterleaved) {
      return <div ref={this.onRef} style={{width, marginBottom}}>{children}</div>;
    }

    // Need to set pointer-events:none if the scroll block is invisible,
    // otherwise it would block the mouse events from reaching the visualization
    // behind it, and leave the user wondering why scrubbing doesn't work in
    // the left half of the visualization.
    const opacity = isActive ? 1 : 0.6;

    return (
      <div ref={this.onRef} className={css(styles.scrollBlock)} style={{opacity, width, marginBottom}}>
        <div className={css(styles.scrollBlockContent)}>
          {children}
        </div>
      </div>
    );
  }
}

ScrollBlock.propTypes = {
  isInterleaved: PropTypes.bool,
  isActive: PropTypes.bool,
  width: PropTypes.number,
  marginBottom: PropTypes.number,
  requestMeasure: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default ScrollBlock;
