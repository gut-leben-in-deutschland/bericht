import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import {defaultMemoize as memoize} from 'reselect';

import {select, mouse, event} from 'd3-selection';
import {transition} from 'd3-transition';
import {scaleBand, scaleLinear, scaleQuantize, scalePoint} from 'd3-scale';
import {shuffle, range, extent, max, ascending} from 'd3-array';

import {getFormat} from 'components/Chart/utils';
import {Tooltip} from 'components/Tooltip/Tooltip';

import {sansRegular12, sansRegular18, sansRegular32, sansBold18, sansBold24} from 'theme/typeface';
import {white, black, midGrey, lightGrey} from 'theme/constants';

import {dimensionSchemes} from 'utils/dimension';
import {shallowEqual} from 'utils/shallowEqual';
import {highlight} from 'utils/highlight';
import {getLowerAndHigher} from 'utils/percentiles';

import PersonIcon from 'components/Flagship/Icons/Person.icon.svg';


const TRANSITION_DURATION = 650;
// const QUICK_TRANSITION_DURATION = 120;

// Used for the X-axis. Since we're showing percentiles, this doesn't need to
// be configurable.
const percentFormat = getFormat('.0%');


function last(xs) {
  return xs[xs.length - 1];
}

function formatValue(value, numberFormat, unit) {
  return `${getFormat(numberFormat)(value)} ${unit}`;
}

const styles = StyleSheet.create({
  centerText: {
    ...sansBold24,

    position: 'absolute',
    width: 200,
    left: 'calc(50% - 100px)',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    transition: 'opacity .2s',
  },
  centerIcon: {
    marginBottom: 12,
  },

  bucketLabel: {
    ...sansRegular12,
    fill: midGrey,
  },

  axisLabel: {
    ...sansRegular12,
    fill: midGrey,
  },

  valueLabel: {
    ...sansRegular12,
    fill: midGrey,
  },

  bottomBar: {
    position: 'absolute',
    right: 20,
    left: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bottomBarLeft: {
    flexGrow: 1,
    textAlign: 'left',
  },
  bottomBarRight: {
    flexGrow: 1,
    textAlign: 'right',
  },

  bottomBarTop: {
    ...sansRegular32,
  },
  bottomBarBottom: {
    ...sansRegular18,
  },
  bottomBarLabelString: {
    ...sansBold18,
  },

  interactionLayer: {
    fill: 'transparent',
    userSelect: 'none',
    '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
  }
});


export const percentilesVisualizationStages = {
  randomDistribution: {
    dataSource: 'random',
    groupBy: 1,
    dotYPosition: 'fixed',
    showTooltip: false,
    showLabels: false,
    showValueLabels: false,
    showBottomBar: false,
    showCenterText: true,
    heightWhenInterleaved: 300,
  },
  sortedDots: {
    dataSource: 'sorted',
    groupBy: 10,
    dotYPosition: 'fixed',
    showTooltip: true,
    showLabels: true,
    showValueLabels: false,
    showBottomBar: true,
    showCenterText: false,
    heightWhenInterleaved: 200,
  },
  bars: {
    dataSource: 'sorted',
    groupBy: 10,
    dotYPosition: 'actual',
    showTooltip: true,
    showLabels: true,
    showValueLabels: true,
    showBottomBar: true,
    showCenterText: false,
    heightWhenInterleaved: 400,
  },
};

const getInnerHeight = ({isInterleaved, height, stage}) => {
  const {heightWhenInterleaved} = percentilesVisualizationStages[stage];

  return isInterleaved ?
    heightWhenInterleaved :
    height;
};

export const getHeight = (props) => {
  const {isInterleaved, stage, userValue} = props;
  const {showBottomBar} = percentilesVisualizationStages[stage];

  const hasBottomBar = showBottomBar && userValue !== undefined;
  const bottomBarHeight = hasBottomBar ? 130 : 0;

  return getInnerHeight(props) + (isInterleaved ? bottomBarHeight : 0);
};

function leftColor(colorScale) {
  return colorScale.range()[0];
}
function rightColor(colorScale) {
  const colorRange = colorScale.range();
  return colorRange[colorRange.length - 1];
}

const centerIcons = {
  '05': <PersonIcon />,
};


function createSelections(data, parent, el, className, keyFunction) {
  const update = parent.selectAll(`${el}.${className}`).data(data, keyFunction);
  const exit = update.exit();
  const enter = update.enter().append(el).classed(className, 1);

  return {
    update, exit, enter,
    all: update.merge(exit).merge(enter),
    visible: update.merge(enter),
  };
}

const getUserX = (value, data, xScale) => {
  const getX = (percentile) => xScale(undefined, percentile - 1);
  const {lower, higher} = getLowerAndHigher(1, data, value);
  let x;
  if (!lower) {
    x = getX(1) - (getX(2) - getX(1)) / 2;
  } else if (!higher) {
    x = getX(99) + (getX(99) - getX(98)) / 2;
  } else {
    x = getX(lower) + (getX(100 - higher) - getX(lower)) / 2;
  }
  return x;
};

export class PercentilesVisualization extends Component {
  constructor(props) {
    super(props);

    // Component state is not used yet.
    this.state = {
      // The item in the 'data' array which is currently under the cursor.
      hover: undefined,
    };


    this.root = undefined;
    this.rootRef = ref => { this.root = ref; };

    this.svg = undefined;
    this.svgRef = ref => { this.svg = ref; };


    this.padding = memoize((isInterleaved) => {
      return isInterleaved
        ? {top: 20, right: 20, bottom: 20, left: 20}
        : {top: 20, right: 20, bottom: 20, left: 20};
    });

    // A linear scale across the whole range. Used when placing the dots at
    // a random position.
    this.linearXScaleFn = memoize((data, padding, width) => {
      return scalePoint()
        .domain(range(data.length))
        .range([padding.left, width - padding.right]);
    });

    this.x0ScaleFn = memoize((data, padding, width, groupBy) => {
      return scaleBand()
        .domain(range(Math.ceil(data.length / groupBy)))
        .rangeRound([padding.left, width - padding.right])
        .paddingInner(0.2);
    });

    this.x1ScaleFn = memoize((data, x0, groupBy) => {
      return scalePoint()
        .domain(range(groupBy))
        .range([0, x0.bandwidth()]);
    });

    this.yScaleFn = memoize((isInterleaved, data, userValue, padding, height) => {
      const barsHeight = Math.round(height / (isInterleaved ? 2 : 3));
      const halfBarsHeight = Math.floor(barsHeight / 2);

      const verticalCenter = isInterleaved
        ? halfBarsHeight + 40
        : Math.floor(height / 2);

      return scaleLinear()
        .domain([0, max([max(data, d => +d.value), userValue || 0])])
        .range([verticalCenter + halfBarsHeight, verticalCenter - halfBarsHeight]);
    });

    this.colorScaleFn = memoize((data, dimensionId) => {
      return scaleQuantize()
        .domain(extent(data, d => +d.value))
        .range(dimensionSchemes(dimensionId).sequential
          .slice(-5) // only use the 5 darkest colors
        );
    });

    // d => Number, mapping dots to their position on the X-axis.
    this.dotXFn = memoize((isInterleaved, xLinear, x0, x1, groupBy) => {
      return groupBy === 1 || isInterleaved
        ? (d, i) => xLinear(i)
        : (d, i) => {
          const bucket = Math.floor(i / groupBy);
          return x0(bucket) + x1(i - bucket * groupBy);
        };
    });

    // Like dotXFn, but for the Y-position.
    this.dotYFn = memoize((y, height, dotYPosition) => {
      return dotYPosition === 'fixed'
        ? () => Math.round(height * 0.6)
        : d => y(+d.value);
    });


    this.shuffledData = memoize((data) => {
      return shuffle(data.slice(0));
    });

    this.dataSource = () => {
      const {dataSource} = percentilesVisualizationStages[this.props.stage];
      return dataSource === 'random'
        ? this.shuffledData(this.props.data)
        : this.props.data.slice(0).sort((a, b) => ascending(+a.percentile, +b.percentile));
    };


    this.updateBars = memoize((g, data, isInterleaved, xLinear, x0, x1, y, color, height, dotYPosition, groupBy) => {
      const sel = createSelections(data, g, 'line', 'line', d => `${d.percentile}-${d.category}-${d.gender}`);
      sel.exit.remove();

      const x = this.dotXFn(isInterleaved, xLinear, x0, x1, groupBy);
      const y1 = this.dotYFn(y, height, dotYPosition);
      const y2 = dotYPosition === 'fixed' ? y1 : y.range()[0];

      sel.enter
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', y1)
        .attr('y2', y2)
        .attr('stroke', d => color(d.value))
        .style('pointer-events', 'none');

      sel.visible
        .attr('x1', x)
        .attr('x2', x)
        .attr('stroke', d => color(d.value));

      sel.visible.transition()
        .duration(TRANSITION_DURATION)
        .attr('y1', y1)
        .attr('y2', y2);
    });

    this.updateDots = memoize((g, data, isInterleaved, xLinear, x0, x1, y, color, height, dotYPosition, groupBy) => {
      const sel = createSelections(data, g, 'circle', 'dot', d => `${d.percentile}-${d.category}-${d.gender}`);
      sel.exit.remove();

      const cx = this.dotXFn(isInterleaved, xLinear, x0, x1, groupBy);
      const cy = this.dotYFn(y, height, dotYPosition);

      sel.enter
        .attr('cx', cx)
        .attr('cy', cy)
        .style('pointer-events', 'none');

      sel.visible
        .attr('r', isInterleaved ? 1 : 3.5)
        .attr('fill', d => color(d.value))
        .attr('stroke', d =>  color(d.value));

      sel.visible.transition()
        .duration(TRANSITION_DURATION)
          .attr('cx', cx)
          .attr('cy', cy);
    });

    this.updateLabels = memoize((g, isInterleaved, x0, y, height, showLabels, groupBy, dotYPosition, leftAxisLabel, rightAxisLabel) => {
      const dataForSelection = x0.domain();


      // Labels for groups (X% - Y%)
      const sel = createSelections(dataForSelection, g, 'text', css(styles.bucketLabel));
      sel.exit.remove();

      const yPos = dotYPosition === 'fixed'
        ? Math.round(height * 0.6)
        : y.range()[0];

      sel.enter
        .attr('y', yPos + 26)
        .style('opacity', 0)
        .style('user-select', 'none');

      sel.visible
        .attr('x', d => x0(d) + x0.bandwidth() / 2)
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .text(d => `${percentFormat(d / 10 + 0.01)} - ${percentFormat((d + 1) / 10)}`);

      if (showLabels && !isInterleaved) {
        sel.visible.transition()
          .duration(TRANSITION_DURATION)
          .attr('y', yPos + 26)
          .style('opacity', 1);
      } else {
        sel.visible.transition()
          .duration(TRANSITION_DURATION)
          .attr('y', yPos + 26)
          .style('opacity', 0);
      }


      // Line at the bottom of each group (/------\)
      const bottomEdges = createSelections(dataForSelection, g, 'path', 'bottom-edge');
      bottomEdges.exit.remove();

      function pathAttr(d) {
        const x = x0(d);
        const w = x0.bandwidth();
        const b = y.range()[0];

        return `M${x - 4} ${b + 10} l0 -3 l${w + 8} 0 l0 3`;
      }

      bottomEdges.enter
        .style('opacity', 0);

      bottomEdges.visible
        .attr('d', pathAttr)
        .style('stroke', lightGrey)
        .style('fill', 'transparent');

      if (showLabels && !isInterleaved && dotYPosition !== 'fixed') {
        bottomEdges.visible.transition()
          .duration(TRANSITION_DURATION)
          .style('opacity', 1);
      } else {
        bottomEdges.visible.transition()
          .duration(TRANSITION_DURATION)
          .style('opacity', 0);
      }


      // Labels on the left/right edge of the X-axis.
      const axisLabels = createSelections([
        {
          x: isInterleaved ? x0.range()[0] : x0(x0.domain()[0]) + x0.bandwidth() / 2,
          textAnchor: isInterleaved ? 'start' : 'middle',
          text: leftAxisLabel
        },
        {
          x: isInterleaved ? last(x0.range()) : x0(last(x0.domain())) + x0.bandwidth() / 2,
          textAnchor: isInterleaved ? 'end' : 'middle',
          text: rightAxisLabel
        }
      ], g, 'text', css(styles.axisLabel));

      axisLabels.exit.remove();

      axisLabels.enter
        .attr('y', yPos + 48)
        .style('opacity', 0)
        .style('user-select', 'none');

      axisLabels.visible
        .attr('x', d => d.x)
        .style('text-anchor', d => d.textAnchor)
        .style('pointer-events', 'none')
        .text(d => d.text);

      if (showLabels) {
        axisLabels.visible.transition()
          .duration(TRANSITION_DURATION)
          .attr('y', yPos + 48)
          .style('opacity', 1);
      } else {
        axisLabels.visible.transition()
          .duration(TRANSITION_DURATION)
          .attr('y', yPos + 48)
          .style('opacity', 0);
      }
    });

    this.updateValueLabels = memoize((g, data, dotX, dotY, showValueLabels, numberFormat, unit) => {
      const dataForSelection = [
        {d: data[0], xOffset: 10, textOffset: 4, yOffset: -40, textAnchor: 'start'},
        {d: last(data), xOffset: -10, textOffset: -4, yOffset: -20, textAnchor: 'end'},
      ];

      const opacity = showValueLabels ? 1 : 0;

      const text = createSelections(dataForSelection, g, 'text', css(styles.valueLabel));
      text.exit.remove();

      text.enter
        .attr('x', d => dotX(d.d, data.indexOf(d.d)) + d.xOffset + d.textOffset)
        .attr('y', d => dotY(d.d) + d.yOffset + 2)
        .style('text-anchor', d => d.textAnchor)
        .style('opacity', opacity)
        .style('user-select', 'none')
        .style('pointer-events', 'none')
        .text(d => formatValue(+d.d.value, numberFormat, unit));

      text.visible
        .style('text-anchor', d => d.textAnchor)
        .text(d => formatValue(+d.d.value, numberFormat, unit))
        .transition()
          .duration(TRANSITION_DURATION)
          .attr('x', d => dotX(d.d, data.indexOf(d.d)) + d.xOffset + d.textOffset)
          .attr('y', d => dotY(d.d) + d.yOffset + 2)
          .style('opacity', opacity);


      const line = createSelections(dataForSelection, g, 'line', 'value-label-line');
      line.exit.remove();

      line.enter
        .attr('x1', d => dotX(d.d, data.indexOf(d.d)) + d.xOffset)
        .attr('y1', d => dotY(d.d) + d.yOffset)
        .attr('x2', d => dotX(d.d, data.indexOf(d.d)))
        .attr('y2', d => dotY(d.d) - 3)
        .attr('stroke', black)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .style('text-anchor', d => d.textAnchor)
        .style('opacity', 1)
        .style('user-select', 'none')
        .style('pointer-events', 'none');

      line.visible
        .transition()
          .duration(TRANSITION_DURATION)
          .attr('x1', d => dotX(d.d, data.indexOf(d.d)) + d.xOffset)
          .attr('y1', d => dotY(d.d) + d.yOffset)
          .attr('x2', d => dotX(d.d, data.indexOf(d.d)))
          .attr('y2', d => dotY(d.d) - 3)
          .style('opacity', opacity);
    });

    this.updateBottomBar = memoize((g, data, width, height, y, dotX, padding, showBottomBar, colorScale, userValue) => {
      const dataForSelection = userValue !== undefined && showBottomBar
        ? [1]
        : [];
      const left = createSelections(dataForSelection, g, 'path', 'left');
      left.exit.remove();
      const right = createSelections(dataForSelection, g, 'path', 'right');
      right.exit.remove();

      if (!dataForSelection.length) {
        return;
      }

      const {lower, higher} = getLowerAndHigher(1, data, userValue);

      const lowerDatum = data.find(d => +d.percentile === lower);
      const lowerX = dotX(lowerDatum, data.indexOf(lowerDatum));

      const higherDatum = data.find(d => +d.percentile === 100 - higher);
      const higherX = dotX(higherDatum, data.indexOf(higherDatum));

      const top = y.range()[0] + 70;

      left.enter.style('opacity', 0);
      left.visible
        .attr('d', `M${padding.left} ${top} L${lowerX - 5} ${top} L${lowerX - 1} ${top - 4} L${lowerX - 5} ${top - 8} L${padding.left} ${top - 8} Z`)
        .attr('fill', leftColor(colorScale))
        .transition()
          .duration(TRANSITION_DURATION)
          .style('opacity', 1);

      right.enter.style('opacity', 0);
      right.visible
        .attr('d', `M${width - padding.right} ${top} L${higherX + 5} ${top} L${higherX + 1} ${top - 4} L${higherX + 5} ${top - 8} L${width - padding.right} ${top - 8} Z`)
        .attr('fill', rightColor(colorScale))
        .transition()
          .duration(TRANSITION_DURATION)
          .style('opacity', 1);
    });

    this.updateHighlights = memoize((g, dataSource, data, isInterleaved, xLinear, x0, x1, y, height, dotYPosition, groupBy, hover, userValue, colorScale) => {
      const cx = this.dotXFn(isInterleaved, xLinear, x0, x1, groupBy);

      let hoverData = [];
      if (dataSource !== 'random' && hover !== undefined) {
        hoverData = [hover];
      }

      const cy = this.dotYFn(y, height, dotYPosition);

      const bar = createSelections(hoverData, g, 'line', 'bar');
      bar.exit.remove();
      bar.visible
        .attr('x1', d => cx(d.d, d.i))
        .attr('x2', d => cx(d.d, d.i))
        .attr('y1', d => cy(d.d, d.i))
        .attr('y2', y.range()[0])
        .attr('stroke', d => colorScale(d.d.value))
        .attr('stroke-width', 3)
        .style('pointer-events', 'none')
        .style('opacity', dotYPosition === 'fixed' ? 0 : 1);

      const circle = createSelections(hoverData, g, 'circle', 'circle');
      circle.exit.remove();
      circle.visible
        .attr('r', 6.5)
        .attr('cx', d => cx(d.d, d.i))
        .attr('cy', d => cy(d.d, d.i))
        .attr('fill', white)
        .attr('stroke', d => colorScale(d.d.value))
        .attr('stroke-width', 2)
        .style('pointer-events', 'none');

      let userData = [];
      if (dataSource !== 'random' && userValue !== undefined) {
        userData = [{
          x: getUserX(userValue, data, cx),
          value: userValue
        }];
      }
      const userCircle = createSelections(userData, g, 'circle', 'user');
      userCircle.exit.remove();
      userCircle.enter
        .attr('cx', d => d.x)
        .attr('cy', cy);
      userCircle.visible
        .raise()
        .attr('r', 6.5)
        .attr('fill', 'transparent')
        .attr('stroke', black)
        .attr('stroke-width', 2)
        .style('pointer-events', 'none');

      userCircle.visible.transition().duration(TRANSITION_DURATION)
        .attr('cx', d => d.x)
        .attr('cy', cy);
    });

    this.updateInteractionLayer = memoize((interactionLayer, isInterleaved, width, height, data, xLinear, x0, x1, yScale, groupBy) => {
      const cx = this.dotXFn(isInterleaved, xLinear, x0, x1, groupBy);

      // How much larger the interaction layer rectangle is on the vertical
      // axis than the chart itself.
      const verticalOverlap = 100;

      const find = () => {
        const [x, y] = mouse(interactionLayer.node());
        const distance = (d, i) => Math.abs(cx(d, i) - x);

        const closest = data.reduce(({d, i}, currentValue, index) => {
          return distance(currentValue, index) < distance(d, i)
            ? {d: currentValue, i: index}
            : {d, i};
        }, {d: data[0], i: 0});

        return y + verticalOverlap > yScale(closest.d.value) ? closest : undefined;
      };

      const blur = () => {
        if (this.state.hover) {
          this.setState({hover: undefined});
        }
      };

      const focus = () => {
        const hit = find();
        const {dotYPosition} = percentilesVisualizationStages[this.props.stage];

        if (hit && dotYPosition !== 'fixed') {
          if (this.state.hover !== hit) {
            this.setState({hover: hit});
          }
        } else {
          blur();
        }
      };

      const y0 = last(yScale.range());
      const y1 = yScale.range()[0];

      interactionLayer
        .attr('x', 0)
        .attr('width', width)
        .attr('y', Math.max(0, y0 - verticalOverlap))
        .attr('height', Math.min(height, (y1 - y0) + 2 * verticalOverlap))
        .on('touchstart', () => {
          this.touchStartTimestamp = event.timeStamp;
          focus();
        })
        .on('touchmove', focus)
        .on('touchend', blur)
        .on('mouseover', () => {
          this.listenToMouse = (
            this.touchStartTimestamp === undefined ||
            (event.timeStamp !== this.touchStartTimestamp && event.timeStamp > 0)
          );
          this.listenToMouse && focus();
        })
        .on('mousemove', () => this.listenToMouse && focus())
        .on('mouseout', blur);
    });
  }

  componentDidMount() {
    const svg = this.svgSelection = select(this.svg);

    this.bars = svg.append('g').classed('bars', 1);
    this.dots = svg.append('g').classed('dots', 1);
    this.labels = svg.append('g').classed('labels', 1);
    this.bottomBar = svg.append('g').classed('bottom-bar', 1);
    this.highlights = svg.append('g').classed('highlights', 1);

    this.interactionLayer = svg.append('rect')
      .attr('class', css(styles.interactionLayer));

    this.update();
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }
  componentDidUpdate() {
    this.update();
  }

  innerHeight() {
    return getInnerHeight(this.props);
  }

  linearXScale() {
    return this.linearXScaleFn(this.props.data, this.padding(), this.props.width);
  }
  x0Scale(groupBy) {
    return this.x0ScaleFn(this.props.data, this.padding(), this.props.width, groupBy);
  }
  x1Scale(groupBy) {
    return this.x1ScaleFn(this.props.data, this.x0Scale(groupBy), groupBy);
  }
  yScale() {
    return this.yScaleFn(this.props.isInterleaved, this.props.data, this.props.userValue, this.padding(), this.innerHeight());
  }
  colorScale() {
    return this.colorScaleFn(this.props.data, this.props.dimensionId);
  }

  update() {
    const {isInterleaved, width, stage,
      leftAxisLabel, rightAxisLabel, numberFormat, unit, userValue} = this.props;
    const {dataSource, groupBy, dotYPosition, showBottomBar, showLabels,
      showValueLabels} = percentilesVisualizationStages[stage];
    const data = this.dataSource();
    const {hover} = this.state;
    const height = this.innerHeight();

    const linearXScale = this.linearXScale();
    const x0Scale = this.x0Scale(groupBy);
    const x1Scale = this.x1Scale(groupBy);
    const yScale = this.yScale();
    const colorScale = this.colorScale();

    const dotX = this.dotXFn(isInterleaved, linearXScale, x0Scale, x1Scale, groupBy);
    const dotY = this.dotYFn(yScale, height, dotYPosition);

    this.updateBars(this.bars, data, isInterleaved, linearXScale, x0Scale,
      x1Scale, yScale, colorScale, height, dotYPosition, groupBy);

    this.updateDots(this.dots, data, isInterleaved, linearXScale, x0Scale,
      x1Scale, yScale, colorScale, height, dotYPosition, groupBy);

    this.updateLabels(this.labels, isInterleaved, x0Scale, yScale, height,
      showLabels, groupBy, dotYPosition, leftAxisLabel, rightAxisLabel);

    this.updateValueLabels(this.labels, data, dotX, dotY, showValueLabels,
      numberFormat, unit);

    this.updateBottomBar(this.bottomBar, data, width, height, yScale, dotX,
      this.padding(), showBottomBar, colorScale, userValue);

    this.updateHighlights(this.highlights, dataSource, data, isInterleaved, linearXScale, x0Scale,
      x1Scale, yScale, height, dotYPosition, groupBy, hover, userValue, colorScale);

    this.updateInteractionLayer(this.interactionLayer, isInterleaved, width,
      height, data, linearXScale, x0Scale, x1Scale, yScale, groupBy);
  }

  renderTooltip() {
    const {isInterleaved, data, width, stage, numberFormat, tooltips,
      unit, userValue, t} = this.props;
    const {hover} = this.state;
    const {groupBy, dotYPosition, showTooltip} = percentilesVisualizationStages[stage];
    const height = this.innerHeight();

    const linearXScale = this.linearXScale();
    const x0Scale = this.x0Scale(groupBy);
    const x1Scale = this.x1Scale(groupBy);
    const yScale = this.yScale();

    const cx = this.dotXFn(isInterleaved, linearXScale, x0Scale, x1Scale, groupBy);
    const cy = this.dotYFn(yScale, height, dotYPosition);

    if (!showTooltip) {
      return null;
    }

    let tooltipDatum;
    let title = null;
    if (hover) {
      title = t('flagship/percentiles/percentile-label', {percentile: hover.d.percentile});
      tooltipDatum = {
        value: hover.d.value,
        x: cx(hover.d, hover.i)
      };
    } else if (tooltips === 'user' && userValue !== undefined) {
      tooltipDatum = {
        value: userValue,
        x: getUserX(userValue, data, cx)
      };
    } else {
      return null;
    }

    return (
      <Tooltip
        boundingRect={{
          left: tooltipDatum.x - 7,
          top: cy(tooltipDatum) - 7,
          width: 14,
          height: 14,
        }}
        contextRect={{left: 0, width, top: 0}}>
        {title}
        {title && <br />}
        {formatValue(+tooltipDatum.value, numberFormat, unit)}
      </Tooltip>
    );
  }

  renderBottomBar() {
    const {data, stage, lowerLabel, higherLabel, userValue} = this.props;
    const {showBottomBar} = percentilesVisualizationStages[stage];

    if (!showBottomBar || userValue === undefined) {
      return null;
    }

    const {lower, higher} = getLowerAndHigher(1, data, userValue);
    const yScale = this.yScale();
    const top = yScale.range()[0] + 80;

    const colorScale = this.colorScale();

    return (
      <div className={css(styles.bottomBar)} style={{top}}>
        {!!lower && <div className={css(styles.bottomBarLeft)} style={{color: leftColor(colorScale)}}>
          <div className={css(styles.bottomBarTop)}>
            {percentFormat(lower / 100)}
          </div>
          <div className={css(styles.bottomBarBottom)}>
            {highlight(lowerLabel, /\*\*([^\*]+)\*\*/, css(styles.bottomBarLabelString))}
          </div>
        </div>}
        {!!higher && <div className={css(styles.bottomBarRight)} style={{color: rightColor(colorScale)}}>
          <div className={css(styles.bottomBarTop)}>
            {percentFormat(higher / 100)}
          </div>
          <div className={css(styles.bottomBarBottom)}>
            {highlight(higherLabel, /\*\*([^\*]+)\*\*/, css(styles.bottomBarLabelString))}
          </div>
        </div>}
      </div>
    );
  }

  renderCenterText() {
    const {dimensionId, stage, centerText} = this.props;
    const {showCenterText} = percentilesVisualizationStages[stage];
    const height = this.innerHeight();

    const style = {
      opacity: showCenterText ? 1 : 0,
      color: rightColor(this.colorScale()),
      bottom: height - Math.round(height * 0.6) + 40,
    };

    const icon = centerIcons[dimensionId] === undefined
      ? undefined
      : <div className={css(styles.centerIcon)}>{centerIcons[dimensionId]}</div>;

    return showCenterText && (
      <div className={css(styles.centerText)} style={style}>
        {icon}
        {centerText}
      </div>
    );
  }

  render() {
    const {width} = this.props;
    const height = this.innerHeight();

    return (
      <div ref={this.rootRef} style={{position: 'relative', width, height: getHeight(this.props)}}>
        <svg ref={this.svgRef} style={{width, height}} />
        {this.renderCenterText()}
        {this.renderBottomBar()}
        {this.renderTooltip()}
      </div>
    );
  }
}

PercentilesVisualization.propTypes = {
  isInterleaved: PropTypes.bool.isRequired,

  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,

  stage: PropTypes.oneOf(Object.keys(percentilesVisualizationStages)).isRequired,
  tooltips: PropTypes.string,

  dimensionId: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,

  numberFormat: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,

  centerText: PropTypes.string.isRequired,
  ourLabel: PropTypes.string.isRequired,

  // Labels at the bottom which explain what percentile of the population has
  // a lower or higher value (annual income, leisure time) than the user.
  lowerLabel: PropTypes.string.isRequired,
  higherLabel: PropTypes.string.isRequired,

  // The labels on the left/right edge of the X-axis which are shown on mobile.
  leftAxisLabel: PropTypes.string.isRequired,
  rightAxisLabel: PropTypes.string.isRequired,

  userValue: PropTypes.number,
  t: PropTypes.func.isRequired,
};
