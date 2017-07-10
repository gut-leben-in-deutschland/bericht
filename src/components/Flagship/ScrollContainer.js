import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import {Set} from 'immutable';
import {extent} from 'd3-array';
import PropTypes from 'prop-types';
import raf from 'raf';
import {LinkInline as Link} from 'components/ButtonLink/Link';
import subsup from 'utils/subsup';
import {sansRegular12} from 'theme/typeface';
import {midGrey} from 'theme/constants';
import {ascending} from 'd3-array';

import ScrollBlock from './ScrollBlock';
import {renderMarkdown} from 'components/Markdown/renderMarkdown';
import {defaultReportVisitors} from 'components/Report/ReportPageComponents';

import {scrollY, scrollX, passiveEvent} from 'utils/dom';

const TEXT_BLOCK_WIDTH = 472;

// The usable viewport height for the visualization is always a bit smaller
// than the effective height, because we show the ChapterMenuBar at the top.
// TODO: import this from the ChapterMenuBar component file.
const CHAPTER_MENU_BAR_HEIGHT = 45;

// Extra vertical padding of the visualization. Horizontal padding is already
// ensured because the whole content of the page is wrapped in one of the
// Grid containers. But we don't want the visualization to come too close to
// the top header and bottom edge of the browser.
const VIS_VERTICAL_PADDING = 20;

const VIS_SOURCE_HEIGHT = 30;
const SCROLL_CONTAINER_PADDING_BOTTOM = VIS_SOURCE_HEIGHT * 2;

// Extra width because the visualization uses padding internally, and we want
// it to align with the rest of the content.
const VIS_HORIZONTAL_PADDING = 20;

const FIXED_MODE_TOP = CHAPTER_MENU_BAR_HEIGHT + VIS_VERTICAL_PADDING;

const VIEWPORT_HEIGHT_THRESHOLD = 180;

// The actually usable height is smaller than the whole viewport due to the
// sticky ChapterMenuBar.
// But: we enforce a minimum height because it doesn't make sense to show
// the visualization if there's too little vertical space.
const calcUsableViewportHeight = viewportHeight => {
  return Math.max(
    600,
    viewportHeight
      - CHAPTER_MENU_BAR_HEIGHT
      - 2 * VIS_VERTICAL_PADDING
      - VIS_SOURCE_HEIGHT
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: SCROLL_CONTAINER_PADDING_BOTTOM,
  },
  sourceDesktop: {
    position: 'absolute',
    bottom: -VIS_SOURCE_HEIGHT,
    right: 10
  },
  sourceText: {
    ...sansRegular12,
    color: midGrey,
    textAlign: 'right',
    lineHeight: 1.2
  }
});


const determineMode = (windowScrollY, top, height) => {
  // top edge hasn't reached viewport top
  if (top - FIXED_MODE_TOP > windowScrollY) {
    return 'before';
  }

  // top edge left the viewport
  // bottom part may still be visible
  if (top + height + VIS_VERTICAL_PADDING - window.innerHeight <= windowScrollY) {
    return 'after';
  }

  // top edge has reached viewport top
  // visualization is now sticky
  return 'focus';
};

const visualizationPositionStyle = (mode, left) => {
  switch (mode) {
  case 'before':
    return {
      position: 'absolute',
      left: -VIS_HORIZONTAL_PADDING,
      top: 0,
    };
  case 'focus':
    return {
      position: 'fixed',
      top: FIXED_MODE_TOP,
      left: left - VIS_HORIZONTAL_PADDING,
    };
  case 'after':
    return {
      position: 'absolute',
      left: -VIS_HORIZONTAL_PADDING,
      bottom: 0,
    };
  default:
    throw new Error('Unknown mode', mode);
  }
};

export class ScrollContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      closeScrollBlockIndexes: Set(),
      mobile: true, // initial render mobile, desktop can take the hit
      mode: 'before', // before, focus, after
    };
    this.scrollBlockMeasurements = [];
    this.pastViewportHeights = Set();

    this.scrollBlockRefs = [];

    const measure = () => {
      if (this.ref) {
        const {top, left, width} = this.ref.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        let nextState = {
          effectiveViewportHeight: this.state.effectiveViewportHeight,
          width,
          effectiveWidth: width + 2 * VIS_HORIZONTAL_PADDING,
          top: scrollY() + top,
          left: scrollX() + left
        };

        this.scrollBlockRefs.filter(Boolean).forEach((ref, index) => {
          this.scrollBlockMeasurements[index] = ref.measure();
        });

        const pastViewportHeights = this.pastViewportHeights;
        const [min, max] = extent(pastViewportHeights.add(viewportHeight).toArray());

        if (
          pastViewportHeights.size === 0 || min === undefined || max === undefined
          || max - min > VIEWPORT_HEIGHT_THRESHOLD
          || viewportHeight < this.state.effectiveViewportHeight
        ) {
          nextState.effectiveViewportHeight = viewportHeight;

          this.pastViewportHeights = Set([viewportHeight]);
        } else {
          this.pastViewportHeights = Set([min, max, viewportHeight].filter(Boolean));
        }

        nextState.effectiveWidth = width + 2 * VIS_HORIZONTAL_PADDING;
        nextState.usableViewportHeight = calcUsableViewportHeight(nextState.effectiveViewportHeight);

        // We require both enough vertical and horizontal space for the desktop
        // experience
        nextState.mobile = !(
          nextState.effectiveWidth >= 740 &&
          nextState.effectiveViewportHeight >= 600
        );

        nextState.marginBottom = nextState.mobile ? 0 : (nextState.usableViewportHeight * 0.75);

        nextState.height = this.scrollBlockMeasurements.reduce(
          (height, m) => height + m.height + nextState.marginBottom,
          SCROLL_CONTAINER_PADDING_BOTTOM
        );

        this.setState(nextState);
        this.updateScrollState(nextState);
      }
    };
    let requestedRaf = null;
    this.requestMeasure = () => {
      if (requestedRaf !== null) {
        return;
      }
      requestedRaf = raf(() => {
        requestedRaf = null;
        measure();
      });
    };
    this.onRef = ref => {
      this.ref = ref;
      this.requestMeasure();
    };
    this.onScroll = () => {
      this.updateScrollState(this.state);
    };
  }
  componentWillMount() {
    this.setState({
      activeScrollBlock: this.props.scrollBlocks[0],
      mode: 'before'
    });
  }
  componentDidMount() {
    window.addEventListener('scroll', this.onScroll, passiveEvent());
    window.addEventListener('resize', this.requestMeasure);
    this.requestMeasure();
  }
  componentWillReceiveProps() {
    this.needsMeasure = true;
  }
  componentWillUpdate(nextProps, nextState) {
    if (
      // on mobile the viz height is part of the scroll block height
      (nextState.usableViewportHeight !== this.state.usableViewportHeight) ||

      // PREVENTATIVE REMEASURE
      // if we make the map sticky or unsticky we remeasure
      // the dom to ensure we don't go on top of something outside the container
      // - the dom mesurements should not have changed
      // - if they did a lot, a flash of 1-2 frames with overlayed content will happen
      // - however until a thorough refactor we should leave this in
      (nextState.mode !== this.state.mode && !nextState.mobile)
    ) {
      this.needsMeasure = true;
    }
  }
  componentDidUpdate() {
    if (this.needsMeasure) {
      this.requestMeasure();
      this.needsMeasure = false;
    }
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.requestMeasure);
  }

  updateScrollState(state) {
    const viewportHeight = state.effectiveViewportHeight;
    const top = state.top;
    const height = state.height;

    if (viewportHeight === undefined || top === undefined || height === undefined) {
      return;
    }

    const windowScrollY = scrollY();
    const mode = determineMode(windowScrollY, top, height);
    if (mode !== this.state.mode) {
      this.setState({mode});
    }

    if (this.scrollBlockMeasurements.length) {
      const center = windowScrollY + viewportHeight / 2;
      const scrollBlockDistances = this.scrollBlockMeasurements.map((measurements, index) => {
        return {
          distance: Math.min(
            Math.abs(measurements.top - center),
            Math.abs((measurements.top + measurements.height) - center)
          ),
          index
        };
      });
      scrollBlockDistances.sort((a, b) => ascending(a.distance, b.distance));

      const activeScrollBlock = this.props.scrollBlocks[scrollBlockDistances[0].index];
      if (activeScrollBlock !== this.state.activeScrollBlock) {
        this.setState({activeScrollBlock});
      }

      const maxCloseDistance = window.innerHeight;
      const closeIndexes = Set(
        scrollBlockDistances
          .filter(d => d.distance <= maxCloseDistance)
          .map(d => d.index)
      );
      if (!closeIndexes.equals(this.state.closeScrollBlockIndexes)) {
        this.setState({closeScrollBlockIndexes: closeIndexes});
      }
    }
  }

  markdownVisitors(renderScrollBlock) {
    const {extraZoneVisitors, extraMarkerVisitors} = this.props;

    return {
      ...defaultReportVisitors(this.props.t),

      root: (node, index, parent, visitChildren) => (
        visitChildren(node)
      ),

      zone: (node, index, parent, visitChildren) => {
        if (node.name === 'ScrollBlock') {
          return renderScrollBlock(node, index, parent, visitChildren);
        }
        if (node.name in extraZoneVisitors) {
          return extraZoneVisitors[node.name](node, index, parent, visitChildren);
        }
        return null;
      },

      marker: (node, index, parent, visitChildren) => {
        if (node.name in extraMarkerVisitors) {
          return extraMarkerVisitors[node.name](node, index, parent, visitChildren);
        }
        return null;
      }
    };
  }

  mobileExperience(source) {
    const {
      effectiveWidth, usableViewportHeight,
      closeScrollBlockIndexes
    } = this.state;
    const {
      scrollBlocks,
      visualization, visualizationHeight
    } = this.props;

    const visitors = this.markdownVisitors((node, index, parent, visitChildren) => {
      const showVis = effectiveWidth && closeScrollBlockIndexes.has(index);
      return (
        <ScrollBlock key={index}
          ref={ref => { this.scrollBlockRefs[index] = ref; }}
          requestMeasure={this.requestMeasure}
          marginBottom={node.parameters.skipMobileVisualization ? 18 : 0}
          isInterleaved>
          {visitChildren(node)}
          {!node.parameters.skipMobileVisualization && (
            <div style={{
              marginLeft: -VIS_HORIZONTAL_PADDING,
              height: visualizationHeight ?
                visualizationHeight(node, true, effectiveWidth, usableViewportHeight, 0) :
                usableViewportHeight
            }}>
              {showVis && visualization(node, true, effectiveWidth, usableViewportHeight, 0)}
            </div>
          )}
        </ScrollBlock>
      );
    });

    return (
      <div>
        {renderMarkdown({type: 'root', children: scrollBlocks}, {visitors})}
        <div className={css(styles.sourceText)}>{source}</div>
      </div>
    );
  }


  desktopExperience(source) {
    const {scrollBlocks} = this.props;
    const {
      effectiveWidth,
      mode, left, activeScrollBlock,
      usableViewportHeight, marginBottom
    } = this.state;

    const visitors = this.markdownVisitors((node, index, parent, visitChildren) => {
      return (
        <ScrollBlock key={index}
          ref={ref => { this.scrollBlockRefs[index] = ref; }}
          requestMeasure={this.requestMeasure}
          isActive={activeScrollBlock === node}
          width={TEXT_BLOCK_WIDTH}
          marginBottom={marginBottom}>
          {visitChildren(node)}
        </ScrollBlock>
      );
    });

    return (
      <div>
        <div style={visualizationPositionStyle(mode, left)}>
          {effectiveWidth && this.props.visualization(
            activeScrollBlock,
            false,
            effectiveWidth,
            usableViewportHeight,
            TEXT_BLOCK_WIDTH
          )}
          <div className={css(styles.sourceText, styles.sourceDesktop)}>
            {source}
          </div>
        </div>

        {renderMarkdown({type: 'root', children: scrollBlocks}, {visitors})}
      </div>
    );
  }


  render() {
    const {mobile} = this.state;
    const {t, dimensionId, secondarySource} = this.props;
    const description = {
      source_annotation: t(`flagship/${dimensionId}/source_annotation`, {}, null),
      source_label: t(`flagship/${dimensionId}/source_label`, {}, null),
      source_url: t(`flagship/${dimensionId}/source_url`, {}, null)
    };
    const source = (
      <div>
        {!!(description.source_label || description.source_annotation) && t('charts/source')}{' '}
        {!!(description.source_label || description.source_url) && <Link t={t} href={description.source_url}>{description.source_label}</Link>}
        {' '}{subsup(description.source_annotation)}
        {!!secondarySource && <br />}
        {secondarySource}
      </div>
    );

    return (
      <div ref={this.onRef} className={css(styles.scrollContainer)}>
        {mobile
          ? this.mobileExperience(source)
          : this.desktopExperience(source)
        }
      </div>
    );
  }
}

ScrollContainer.propTypes = {
  t: PropTypes.func.isRequired,
  dimensionId: PropTypes.string.isRequired,
  scrollBlocks: PropTypes.arrayOf((propValue, key, componentName) => {
    const node = propValue[key] || {};
    if (node.type !== 'zone' || node.name !== 'ScrollBlock') {
      const name = node.name ? ` and name \`${node.name}\`` : '';
      const value = node.value ? ` with value  \`${node.value}\`` : '';
      const children = node.children ? ` with children ${[].concat(node.children).map(c => [c.type, c.name, c.value].filter(Boolean).join(':'))}` : '';
      return new Error(
        `Invalid children supplied to \`${componentName}\`. Validation failed.
        All children must be ScrollBlock zones.
        Got node of type \`${node.type}\`${name}${value}${children}`
      );
    }
    return undefined;
  }).isRequired,

  // The function which will render the visualization
  visualization: PropTypes.func.isRequired,
  visualizationHeight: PropTypes.func,

  secondarySource: PropTypes.node,

  // Extra zone and marker visitors, in case the scroll container needs to
  // support custom elements in the markdown AST.
  //
  // The object keys are the zone/marker names, the values are the standard
  // visitor functions.
  extraZoneVisitors: PropTypes.object.isRequired,
  extraMarkerVisitors: PropTypes.object.isRequired,
};
