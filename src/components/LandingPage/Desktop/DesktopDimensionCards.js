import React, {Component, PropTypes} from 'react';
import raf from 'raf';
import {StyleSheet, css} from 'aphrodite';

import {DesktopLandingPageVisualization} from 'components/LandingPage/Desktop/DesktopLandingPageVisualization';
import {DimensionCardDetail} from 'components/LandingPage/DimensionCardDetail';

import {sansRegular24} from 'theme/typeface';
import {text, softBeige} from 'theme/constants';

import {scrollY, passiveEvent} from 'utils/dom';
import {shallowEqual} from 'utils/shallowEqual';
import {mapMaybe} from 'utils/maybe';


// See the 'visPosition' function and 'visPos' property in the component state.
const VIS_POSITION_TOP = 'Top';
const VIS_POSITION_STICKY = 'Sticky';
const VIS_POSITION_BOTTOM = 'Bottom';

const VIS_CONTENT_HEIGHT = 800;

const windowEvents = ['scroll', 'resize'];

const styles = StyleSheet.create({
  prologue: {
    ...sansRegular24,
    color: text,

    marginBottom: 40,
  },

  visBlock: {
    backgroundColor: softBeige,
    position: 'relative',
    margin: '68px 0',
    overflow: 'hidden', // Don't remove, otherwise measurement will be borked
  },

  visContent: {
    backgroundColor: softBeige,
    display: 'flex',
    left: 0,
    right: 0,
    zIndex: 10,

    // position, height, top, bottom are set through inline styles.
  },

  overlay: {
    position: 'absolute',
    display: 'flex',
    top: '-100px',
    right: '-100px',
    bottom: '-100px',
    left: '-100px',
    backgroundColor: 'rgba(255,255,255,.75)',
    cursor: 'pointer',
  },

  introductionContainer: {
    opacity: 0,
    zIndex: -1,
    transition: 'opacity .7s',
    paddingTop: 40,
  },
  visibleIntroductionContainer: {
    opacity: 1,
    zIndex: 20,
  },
});


// Height of each stage. The user must scroll this much to reach the next stage.
function computeStageHeight() {
  return 200; // vh / 2;
}

function visPositionAndStageIndex(windowTopOffset, windowInnerHeight, visContentHeight, visBlockTop, visBlockHeight) {
  const verticalCenterOfViewport = windowTopOffset + windowInnerHeight / 2;

  // The center of the vis content hasn't reached the vertical center of the
  // viewport.
  if (verticalCenterOfViewport < visBlockTop + visContentHeight / 2) {
    return {visPos: VIS_POSITION_TOP, stageIndex: 1};
  }

  // The center of the vis content was pushed above the center of the viewport.
  if (verticalCenterOfViewport > visBlockTop + visBlockHeight - visContentHeight / 2) {
    return {visPos: VIS_POSITION_BOTTOM, stageIndex: 3};
  }

  // The center of the vis content is somewhere in the middle of the vis block.
  const visPos = VIS_POSITION_STICKY;

  const stageHeight = computeStageHeight(windowInnerHeight);
  const windowTopOffsetRem = verticalCenterOfViewport - (visBlockTop + visContentHeight / 2);
  const stageIndex = 1 + Math.ceil(windowTopOffsetRem / stageHeight);

  if (stageIndex > 3) {
    return {visPos, stageIndex: 3};
  }

  return {visPos, stageIndex};
}

function visContentStyle(visPos, height) {
  return ({
    [VIS_POSITION_TOP]: {position: 'absolute', top: 0, height},
    [VIS_POSITION_STICKY]: {position: 'fixed', top: `calc(50% - ${height / 2}px)`, height},
    [VIS_POSITION_BOTTOM]: {position: 'absolute', bottom: 0, height},
  })[visPos];
}

export class DesktopDimensionCards extends Component { // eslint-disable-line
  constructor(props) {
    super(props);

    this.setVisBlockRef = (el) => {
      this.visBlock = el;
    };

    this.state = {
      // window.inner{Width,Height}
      viewportWidth: undefined,
      viewportHeight: undefined,

      // The height of the vis content. It used to depend on the viewport
      // height, but not anymore, It's fixed now.
      visContentHeight: VIS_CONTENT_HEIGHT,

      // The height of the whole 'DimensionCards' block. Default is just enough
      // to fit a single stage into it. After page load this will be expanded
      // to a multiple of the page height, which will determine how much the
      // user has to scroll to work through all the stages of the visualization.
      //
      // MUST be larger than 'visContentHeight'.
      visBlockHeight: VIS_CONTENT_HEIGHT,

      // - VIS_POSITION_TOP: Place the visualization at the top of the
      //   container.
      // - VIS_POSITION_STICKY: Cover the whole viewport with the visualization
      //   (position:fixed)
      // - VIS_POSITION_BOTTOM: Place the visualization at the bottom of the
      //   container.
      visPos: VIS_POSITION_TOP,

      // The top offset of the vis block element. It is unknown initially, and
      // determined after the DOM is loaded. It is used to compute 'stageIndex'
      // and 'visPos'.
      visBlockTop: undefined,

      // The stage which we show in the 'DimensionCards' component. See in the
      // catalog how the different stages look.
      stageIndex: 3,

      hoverDimensionId: undefined,
      selectedDimensionId: undefined,

      hoverIndicatorId: undefined,

      visTop: undefined,
    };

    this.hoverDimension = hoverDimensionId => {
      this.setState(previousState => ({...previousState, hoverDimensionId}));
    };

    this.selectDimension = selectedDimensionId => {
      this.setState(previousState => {
        return previousState.stageIndex === 0
          ? previousState
          : {...previousState, selectedDimensionId};
      });

      this.updateMeasurements();
    };

    this.resetDimensionSelection = () => {
      this.selectDimension(undefined);
    };

    this.hoverIndicator = hoverIndicatorId => {
      this.setState(previousState => ({...previousState, hoverIndicatorId}));
    };

    this.updateMeasurements = () => {
      if (this.currentAnimationFrame) {
        raf.cancel(this.currentAnimationFrame);
      }
      this.currentAnimationFrame = raf(() => {
        this.setState(previousState => {
          const windowTopOffset = scrollY();
          const windowInnerHeight = window.innerHeight;

          const visContentHeight = VIS_CONTENT_HEIGHT;

          const visBlockTop = mapMaybe(this.visBlock, el => el.getBoundingClientRect().top + windowTopOffset);
          const visBlockHeight = 2 * computeStageHeight(windowInnerHeight) + visContentHeight;

          const {visPos, stageIndex} = visBlockTop === undefined
          ? {visPos: VIS_POSITION_TOP, stageIndex: 1}
          : visPositionAndStageIndex(windowTopOffset, windowInnerHeight, visContentHeight, visBlockTop, visBlockHeight);

          // Animation is done
          this.currentAnimationFrame = null;

          return {
            ...previousState,

            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,

            visContentHeight,
            visBlockHeight,
            visBlockTop,
            visPos,
            stageIndex,
          };
        });
      });
    };
  }

  componentDidMount() {
    this.updateMeasurements();
    windowEvents.forEach(e =>
      window.addEventListener(e, this.updateMeasurements, passiveEvent()));
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.state, nextState);
  }
  componentWillUnmount() {
    windowEvents.forEach(e =>
      window.removeEventListener(e, this.updateMeasurements));
    raf.cancel(this.currentAnimationFrame);
  }
  render() {
    const {t, dimensions, indicators} = this.props;
    const {viewportWidth, viewportHeight, hoverDimensionId, selectedDimensionId,
      visBlockHeight, visContentHeight, visPos} = this.state;

    const stageIndex = selectedDimensionId === undefined ? this.state.stageIndex : 4;

    const dimensionCardDetail = selectedDimensionId === undefined ? null : (
      <DimensionCardDetail t={t} dimensions={dimensions} dimensionId={selectedDimensionId}
        viewportWidth={viewportWidth} viewportHeight={viewportHeight}
        gotoNext={() => {}} gotoPrevious={() => {}}
        onClose={this.resetDimensionSelection} />
    );

    return (
      <div ref={this.setVisBlockRef} className={css(styles.visBlock)} style={{height: visBlockHeight}}>
        <div className={css(styles.visContent)} style={visContentStyle(visPos, visContentHeight)}>
          {<DesktopLandingPageVisualization
            t={t}
            vis={visPos}
            stageIndex={stageIndex}
            originalStageIndex={this.state.stageIndex}
            dimensions={dimensions}
            indicators={indicators}
            hoverDimensionId={hoverDimensionId}
            selectDimension={this.selectDimension}
            selectedDimensionId={selectedDimensionId}
            hoverDimension={this.hoverDimension}
            hoverIndicatorId={this.state.hoverIndicatorId}
            hoverIndicator={this.hoverIndicator} />}

          {dimensionCardDetail}
        </div>
      </div>
    );
  }
}

DesktopDimensionCards.propTypes = {
  t: PropTypes.func.isRequired,
  dimensions: PropTypes.array.isRequired,
  indicators: PropTypes.array.isRequired,
};
