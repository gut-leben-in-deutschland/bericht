import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';

import {NarrowContainer} from 'components/Grid/Grid';
import {TableOfContentsHeading} from 'components/LandingPage/Desktop/TableOfContentsHeading';
import {TableOfContentsBody} from 'components/LandingPage/Desktop/TableOfContentsBody';

import {shallowEqual} from 'utils/shallowEqual';
import {passiveEvent} from 'utils/dom';


function computeTocHeadingStage(vh, tocHeadingElement) {
  const {top, bottom} = tocHeadingElement.getBoundingClientRect();

  if (top > vh) {
    // The element is below the viewport.
    return 0;
  }

  // Offset from the bottom of the viewport.
  const bottomOffset = vh - bottom;

  if (bottomOffset < 0) {
    // Element is not fully visible, the bottom is still below the viewport.
    return 0;
  }

  // How many pixels the user has to scroll before stage transitions.
  const stageHeight = vh / 5;

  // We hold any transitions until the bottom is at least 1/4th into the
  // viewport. This ensures that the heading element is roughly in the center
  // of the viewport and chances are that the user is focusing on it.
  const hold = vh / 3;

  // Then each 'stageHeight' pixels, we transition into the next stage.
  // Make sure that we return a valid stage (0, 1 or 2) by clamping the integer.

  return Math.max(0, Math.min(2, 1 + Math.floor((bottomOffset - hold) / stageHeight)));
}

const styles = StyleSheet.create({
  tocContainer: {
    padding: '40px 0',
  },
});

export class DesktopTableOfContents extends Component { // eslint-disable-line
  constructor(props) {
    super(props);

    this.state = {
      headingStage: 2,
      selectedDimension: undefined,
    };

    this.headingRef = ref => {
      this.heading = ref;
    };

    this.selectDimension = selectedDimension => {
      this.setState(previousState =>
        ({...previousState, selectedDimension}));
    };

    this.updateHeadingStage = () => {
      if (this.heading) {
        this.setState(previousState => ({
          ...previousState,
          headingStage: computeTocHeadingStage(window.innerHeight, this.heading),
        }));
      }
    };
  }

  componentDidMount() {
    this.updateHeadingStage();
    window.addEventListener('scroll', this.updateHeadingStage, passiveEvent());
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.state, nextState);
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.updateHeadingStage);
  }

  render() {
    const {t, dimensions} = this.props;
    const {headingStage, selectedDimension} = this.state;

    return (
      <div className={css(styles.tocContainer)}>
        <NarrowContainer>
          <div ref={this.headingRef}>
            <TableOfContentsHeading t={t} stageIndex={headingStage} />
          </div>

          <TableOfContentsBody
            t={t}
            dimensions={dimensions}
            selectedDimensionId={selectedDimension}
            selectDimension={this.selectDimension} />

        </NarrowContainer>
      </div>
    );
  }
}

DesktopTableOfContents.propTypes = {
  t: PropTypes.func.isRequired,
  dimensions: PropTypes.array.isRequired,
};
