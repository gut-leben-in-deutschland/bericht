import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';

import {select, mouse, event} from 'd3-selection';
import {transition} from 'd3-transition';
import {scaleLinear, scalePoint} from 'd3-scale';
import {max} from 'd3-array';

import {getFormat} from 'components/Chart/utils';
import {Tooltip} from 'components/Tooltip/Tooltip';

import MaleIcon from 'components/Flagship/Icons/Male.icon.svg';
import FemaleIcon from 'components/Flagship/Icons/Female.icon.svg';

import {sansRegular12, sansRegular14, sansRegular18, sansRegular32, sansBold14, sansBold24} from 'theme/typeface';
import {white, black, midGrey, lightGrey} from 'theme/constants';

import {shallowEqual} from 'utils/shallowEqual';
import {highlight} from 'utils/highlight';
import {mapMaybe} from 'utils/maybe';
import {getLowerAndHigher} from 'utils/percentiles';
import {onlyS} from 'theme/mediaQueries';

const TRANSITION_DURATION = 650;
const QUICK_TRANSITION_DURATION = 120;

// Used for the X-axis. Since we're showing percentiles, this doesn't need to
// be configurable.
const percentFormat = getFormat('.0%');

const hourFormat = getFormat(',.1f');


// Values for the 'gender' column in the data file.
export const GENDER_MALE = 'Männer';
export const GENDER_FEMALE = 'Frauen';

function colorForGender(gender) {
  return ({
    [GENDER_MALE]: '#890D48',
    [GENDER_FEMALE]: '#C44D79',
  })[gender];
}

function genderIconDimension(gender) {
  return ({
    [GENDER_MALE]: {width: 19, height: 63},
    [GENDER_FEMALE]: {width: 17, height: 59},
  })[gender];
}

// Values for the 'category' column in the data file.
export const CATEGORY_DESIRED_WORKING_HOURS = 'Gewünschte Arbeitszeit';
export const CATEGORY_ACTUAL_WORKING_HOURS  = 'Tatsächliche Arbeitszeit';

// Padding on the outer edges (left of the left box and right of the right box,
// when both boxes are arranged horizontally). This SHOULD match the
// ScrollContainer VIS_HORIZONTAL_PADDING.
const BOX_OUTER_HORIZONTAL_PADDING = 20;

// Padding between the male/famale boxes when boxLayout is vertical.
const INTRA_BOX_VERTICAL_PADDING = 40;

const OUTER_VERTICAL_PADDING = 40;

// The width/height of a box when the box layout is vertical. The height is
// also used in the horizontal layout!
const MAX_BOX_WIDTH = 430;
const BOX_HEIGHT = 200;

// Approximate height of the part below the chart which shows the lower/higher
// bar and the corresponding labels.
const BOTTOM_PART_HEIGHT = 140;

const X_AXIS_LABEL_HEIGHT = 32;

// Horizontal padding between charts (actual/desired working hours) and between
// the two boxes when layout is horizontal.
function innerPadding(isInterleaved) {
  return isInterleaved ? 40 : 68;
}

function boxHeight(isInterleaved, sc, desiredWorkingHours, actualWorkingHours) {
  const personalization = (
    desiredWorkingHours !== undefined || actualWorkingHours !== undefined
  );
  if (isInterleaved) {
    if (sc.boxLayout === 'vertical') {
      return BOX_HEIGHT;
    }

    if (sc.dotYPosition === 'fixed') {
      return 40 + X_AXIS_LABEL_HEIGHT;
    }

    return BOX_HEIGHT +
      X_AXIS_LABEL_HEIGHT +
      (sc.showBottomBar && personalization ? BOTTOM_PART_HEIGHT : 0);
  }

  return BOX_HEIGHT + X_AXIS_LABEL_HEIGHT + BOTTOM_PART_HEIGHT;
}


function last(xs) {
  return xs[xs.length - 1];
}

const styles = StyleSheet.create({
  xAxisRangeLabels: {
    ...sansRegular12,
    fill: midGrey,
  },

  genderLabel: {
    ...sansBold24,
    fill: midGrey
  },

  bottomChartLabel: {
    ...sansRegular12,
    fill: midGrey,
  },

  topChartLabel: {
    fill: midGrey,
    ...sansRegular18,
    [onlyS]: {
      ...sansRegular14
    }
  },


  highlightText: {
    ...sansBold14,
    fill: black,
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
  },
  bottomBarLeft: {
    float: 'left',
    width: '50%',
    paddingRight: 12,
    textAlign: 'left',
  },
  bottomBarRight: {
    float: 'right',
    width: '50%',
    paddingLeft: 12,
    textAlign: 'right',
  },
  bottomBarTop: {
    ...sansRegular32,
  },
  bottomBarBottom: {
    ...sansRegular14,
  },
  bottomBarLabelString: {
    ...sansBold14,
  },

  interactionLayer: {
    fill: 'transparent',
    userSelect: 'none',
    '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
  }
});


export const multiplePercentilesVisualizationStages = {
  randomDistribution: {
    dataSource: 'random',
    boxLayout: 'vertical',
    groupBy: 1,
    dotYPosition: 'fixed',
    showChartXAxisLegend: false,
    showTooltips: false,
    showLabels: false,
    showValueLabels: false,
    showBottomBar: false,
    showCenterText: true,
    heightWhenInterleaved: 300,
    allowHighlight: false,
  },
  sortedDots: {
    dataSource: 'sorted',
    boxLayout: 'horizontal',
    groupBy: 10,
    dotYPosition: 'fixed',
    showChartXAxisLegend: true,
    showTooltips: true,
    showLabels: true,
    showValueLabels: false,
    showBottomBar: false,
    showCenterText: false,
    heightWhenInterleaved: 200,
    allowHighlight: true,
  },
  bars: {
    dataSource: 'sorted',
    boxLayout: 'horizontal',
    groupBy: 10,
    dotYPosition: 'actual',
    showChartXAxisLegend: true,
    showTooltips: true,
    showLabels: true,
    showValueLabels: true,
    showBottomBar: true,
    showCenterText: false,
    heightWhenInterleaved: 400,
    allowHighlight: true,
  },
};
export const getHeight = ({isInterleaved, height, stage, desiredWorkingHours, actualWorkingHours}) => {
  const sc = multiplePercentilesVisualizationStages[stage];

  if (isInterleaved) {
    return 2 * boxHeight(isInterleaved, sc, desiredWorkingHours, actualWorkingHours) + INTRA_BOX_VERTICAL_PADDING + 2 * OUTER_VERTICAL_PADDING;
  }

  return height;
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
  const {lower, higher} = getLowerAndHigher(5, data, value);
  let x;
  if (!lower) {
    x = xScale(5) - xScale.step() / 2;
  } else if (!higher) {
    x = xScale(95) + xScale.step() / 2;
  } else {
    x = xScale(lower) + (xScale(100 - higher) - xScale(lower)) / 2;
  }
  return x;
};

export class MultiplePercentilesVisualization extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoverPercentile: undefined,
    };


    this.root = undefined;
    this.rootRef = ref => { this.root = ref; };

    this.svg = undefined;
    this.svgRef = ref => { this.svg = ref; };


    this.dataSource = () => {
      return this.props.data;
    };
  }

  componentDidMount() {
    const svg = this.svgSelection = select(this.svg);

    // Box is the group with two charts, with two charts side-by-side (one
    // for the actual and one for the desired working hours).
    function createBoxGroup(gender) {
      const boxG = svg.append('g').classed(gender, 1);

      // Each chart (left/right) contains all the layers which are used to
      // render its bars, dots, labels etc.
      function createChartGroup(side) {
        const chartG = boxG.append('g').classed(side, 1);
        return {
          bars: chartG.append('g').classed('bars', 1),
          dots: chartG.append('g').classed('dots', 1),
          labels: chartG.append('g').classed('labels', 1),
          bottomBar: chartG.append('g').classed('bottom-bar', 1),
          highlights: chartG.append('g').classed('highlights', 1),
          interactionLayer: chartG.append('rect')
            .attr('class', css(styles.interactionLayer)),
        };
      }

      return {
        g: boxG,
        left: createChartGroup('left'),
        right: createChartGroup('right'),
        icon: svg.select(`g.${gender}-icon`),
      };
    }

    this.svgMaleBox   = createBoxGroup('male');
    this.svgFemaleBox = createBoxGroup('female');

    this.isInitialRender = true;
    this.update();
    this.isInitialRender = false;
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }
  componentDidUpdate() {
    this.update();
  }

  height() {
    return getHeight(this.props);
  }

  maleBoxPosition(sc, width, height) {
    const {isInterleaved, desiredWorkingHours, actualWorkingHours} = this.props;
    const boxWidth = Math.min(width - 2 * BOX_OUTER_HORIZONTAL_PADDING, MAX_BOX_WIDTH);

    if (isInterleaved) {
      const personalization = (
        desiredWorkingHours !== undefined || actualWorkingHours !== undefined
      );
      return {
        left: (width - boxWidth) / 2,
        width: boxWidth,
        bottom: height - (sc.showBottomBar && personalization ? BOTTOM_PART_HEIGHT : 0) - X_AXIS_LABEL_HEIGHT - OUTER_VERTICAL_PADDING,
        height: BOX_HEIGHT,
      };
    }

    if (sc.boxLayout === 'vertical') {
      return {
        left: (width - boxWidth) / 2,
        width: boxWidth,
        bottom: height - Math.floor(height * 0.25),
        height: BOX_HEIGHT,
      };
    }

    const w = (width - innerPadding(isInterleaved) - 2 * BOX_OUTER_HORIZONTAL_PADDING) / 2;

    return {
      left: BOX_OUTER_HORIZONTAL_PADDING + w + innerPadding(isInterleaved),
      width: w,
      bottom: height - Math.floor(height * 0.3),
      height: BOX_HEIGHT,
    };
  }

  updateMaleBox(sc, isInterleaved, data, width, height) {
    this.updateBox(sc, this.svgMaleBox, this.maleBoxPosition(sc, width, height),
      data, GENDER_MALE);
  }


  femaleBoxPosition(sc, width, height) {
    const {isInterleaved, desiredWorkingHours, actualWorkingHours} = this.props;
    const boxWidth = Math.min(width - 2 * BOX_OUTER_HORIZONTAL_PADDING, MAX_BOX_WIDTH);

    if (isInterleaved) {
      const mbp = this.maleBoxPosition(sc, width, height);

      return {
        left: (width - boxWidth) / 2,
        width: boxWidth,
        bottom: (
          mbp.bottom - boxHeight(isInterleaved, sc, desiredWorkingHours, actualWorkingHours) - INTRA_BOX_VERTICAL_PADDING
        ),
        height: BOX_HEIGHT,
      };
    }

    if (sc.boxLayout === 'vertical') {
      return {
        left: (width - boxWidth) / 2,
        width: boxWidth,
        bottom: height - Math.floor(height * 0.25) - BOX_HEIGHT - INTRA_BOX_VERTICAL_PADDING,
        height: BOX_HEIGHT,
      };
    }

    const w = (width - innerPadding(isInterleaved) - 2 * BOX_OUTER_HORIZONTAL_PADDING) / 2;

    return {
      left: BOX_OUTER_HORIZONTAL_PADDING,
      width: w,
      bottom: height - Math.floor(height * 0.3),
      height: BOX_HEIGHT,
    };
  }

  updateFemaleBox(sc, isInterleaved, data, width, height) {
    this.updateBox(sc, this.svgFemaleBox, this.femaleBoxPosition(sc, width, height),
      data, GENDER_FEMALE);
  }


  // Left/right X-scale is specific for the subset of the data that is shown
  // (desired vs actual working hours).
  xScales(data, gender, {left, width}) {
    const {isInterleaved} = this.props;
    const chartWidth = Math.floor((width - innerPadding(isInterleaved)) / 2);

    const dataForGender = data.filter(x => x.gender === gender);
    function dataForChart(category) {
      return dataForGender.filter(x => x.category === category);
    }
    function domainForChart(category) {
      return dataForChart(category).map(x => +x.percentile);
    }

    return {
      leftXScale: scalePoint()
        .domain(domainForChart(CATEGORY_DESIRED_WORKING_HOURS))
        .range([left, left + chartWidth]),
      rightXScale: scalePoint()
      .domain(domainForChart(CATEGORY_ACTUAL_WORKING_HOURS))
        .range([left + width - chartWidth, left + width]),
    };
  }

  // Y-scale is the same for all charts, its domain is the full extent of the
  // whole dataset.
  yScale(data, {bottom, height}) {
    const {actualWorkingHours, desiredWorkingHours} = this.props;
    return scaleLinear()
      .domain([0, max([
        max(data, d => +d.value),
        actualWorkingHours || 0,
        desiredWorkingHours || 0
      ])])
      .range([bottom, bottom - height]);
  }

  updateBox(sc, svgBox, pos, data, gender) {
    const {desiredWorkingHours, actualWorkingHours} = this.props;
    const yScale = this.yScale(data, pos);
    const {leftXScale, rightXScale} = this.xScales(data, gender, pos);

    const dataForGender = data.filter(x => x.gender === gender);
    function dataForChart(category) {
      return dataForGender.filter(x => x.category === category);
    }

    this.updateChart(sc, svgBox.left, gender, dataForChart(CATEGORY_DESIRED_WORKING_HOURS),
      leftXScale, yScale, CATEGORY_DESIRED_WORKING_HOURS, desiredWorkingHours);
    this.updateChart(sc, svgBox.right, gender, dataForChart(CATEGORY_ACTUAL_WORKING_HOURS),
      rightXScale, yScale, CATEGORY_ACTUAL_WORKING_HOURS, actualWorkingHours);

    this.updateIcon(sc, svgBox.icon, gender, pos);


    // Gender label, centered horizontally in the box, only shown when
    // boxLayout == 'vertical'.
    const genderLabel = createSelections([1], svgBox.g, 'text', css(styles.genderLabel));
    genderLabel.exit.remove();

    const genderLabelX = pos.left + pos.width / 2;
    const genderLabelY = pos.bottom - 50;

    const genderLabelTextKey = ({
      [GENDER_MALE]: 'flagship/multiple-percentiles/male',
      [GENDER_FEMALE]: 'flagship/multiple-percentiles/female',
    })[gender];

    genderLabel.enter
      .attr('x', genderLabelX)
      .attr('y', genderLabelY)
      .style('text-anchor', 'middle')
      .style('user-select', 'none')
      .style('fill', colorForGender(gender))
      .style('opacity', 0)
      .text(this.props.t(genderLabelTextKey));

    genderLabel.visible.transition()
      .duration(TRANSITION_DURATION)
      .attr('x', genderLabelX)
      .attr('y', genderLabelY);

    genderLabel.visible.transition('opacity')
      .duration(QUICK_TRANSITION_DURATION)
      .style('opacity', sc.boxLayout === 'vertical' ? 1 : 0);
  }

  updateChart(sc, g, gender, data, xScale, yScale, category, valueForHighlight) {
    const chartLabelTextKey = ({
      [CATEGORY_DESIRED_WORKING_HOURS]: 'flagship/multiple-percentiles/desired-working-hours',
      [CATEGORY_ACTUAL_WORKING_HOURS]: 'flagship/multiple-percentiles/actual-working-hours',
    })[category];

    this.updateBars(sc, g.bars, gender, data, xScale, yScale);
    this.updateDots(sc, g.dots, gender, data, xScale, yScale);
    this.updateXAxisLabel(sc, g.labels, gender, data, xScale, yScale, chartLabelTextKey);
    this.updateHighlights(sc, g.highlights, gender, data, xScale, yScale, category, valueForHighlight);
    this.updateBottomBar(sc, g.bottomBar, gender, data, xScale, yScale, valueForHighlight);
    this.updateInteractionLayer(sc, g.interactionLayer, data, xScale, yScale, category);
  }

  updateIcon(sc, g, gender, pos) {
    const {isInterleaved, width, height} = genderIconDimension(gender);

    const scale = (() => {
      if (sc.boxLayout === 'vertical') {
        return 1;
      }

      if (isInterleaved) {
        return 0.3;
      }

      return 0.9;
    })();

    const left = (pos.left + pos.width / 2 - width / 2) / scale;
    const yOffset = sc.boxLayout === 'vertical' ? -80 : 10;
    const top = pos.bottom / scale - height + yOffset;

    const subject = this.isInitialRender
      ? g
      : g.transition().duration(TRANSITION_DURATION);

    subject.attr('transform', `scale(${scale}) translate(${left} ${top})`);
  }

  updateBars(sc, g, gender, data, xScale, yScale) {
    const bars = createSelections(data, g, 'line', 'bar');
    bars.exit.remove();

    const x = d => xScale(+d.percentile);
    const y1 = yScale.range()[0];
    const y2 = sc.dotYPosition === 'fixed'
      ? y1
      : d => yScale(+d.value);

    function color() {
      return colorForGender(gender);
    }

    bars.enter
      .attr('x1', x)
      .attr('x2', x)
      .attr('y1', y1)
      .attr('y2', y2)
      .style('pointer-events', 'none');

    bars.visible
      .attr('stroke-width', 1)
      .attr('stroke', d => color(+d.value));

    bars.visible.transition()
      .duration(TRANSITION_DURATION)
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', y1)
        .attr('y2', y2);
  }

  updateDots(sc, g, gender, data, xScale, yScale) {
    const dots = createSelections(data, g, 'circle', 'dot');
    dots.exit.remove();

    const cx = d => xScale(+d.percentile);
    const cy = sc.dotYPosition === 'fixed'
      ? () => yScale.range()[0]
      : d => yScale(+d.value);

    function color() {
      return colorForGender(gender);
    }

    dots.enter
      .attr('cx', cx)
      .attr('cy', cy)
      .style('pointer-events', 'none');

    dots.visible
      .attr('r', 3.5)
      .attr('fill', d => color(+d.value))
      .attr('stroke', d => color(+d.value));

    dots.visible.transition()
      .duration(TRANSITION_DURATION)
        .attr('cx', cx)
        .attr('cy', cy);
  }

  updateXAxisLabel(sc, g, gender, data, xScale, yScale, chartLabelTextKey) {
    // Line at the bottom of the chart, spanning the whole width (/------\)
    const xAxisLine = createSelections([1], g, 'path', 'x-axis-line');
    xAxisLine.exit.remove();

    function pathAttr() {
      const x = xScale.range()[0];
      const w = last(xScale.range()) - x;
      const b = yScale.range()[0];

      return `M${x - 4} ${b + 13} l0 -3 l${w + 8} 0 l0 3`;
    }

    xAxisLine.enter
      .attr('d', pathAttr)
      .style('opacity', 0);

    xAxisLine.visible
      .style('stroke', lightGrey)
      .style('fill', 'transparent');

    if (sc.showChartXAxisLegend) {
      xAxisLine.visible.transition()
        .duration(TRANSITION_DURATION)
        .attr('d', pathAttr)
        .style('opacity', 1);
    } else {
      xAxisLine.visible.transition()
        .duration(TRANSITION_DURATION)
        .attr('d', pathAttr)
        .style('opacity', 0);
    }

    const xAxisRangeLabels = createSelections([
      {d: data[0], textAnchor: 'start', xOffset: -4},
      {d: last(data), textAnchor: 'end', xOffset: 4}
    ], g, 'text', css(styles.xAxisRangeLabels));
    xAxisRangeLabels.exit.remove();

    const xAxisRangeLabelsX = d => xScale(+d.d.percentile) + d.xOffset;
    const xAxisRangeLabelsY = yScale.range()[0] + 30;

    xAxisRangeLabels.enter
      .attr('x', xAxisRangeLabelsX)
      .attr('y', xAxisRangeLabelsY)
      .style('text-anchor', d => d.textAnchor)
      .style('user-select', 'none')
      .style('opacity', 0)
      .text(d => percentFormat(+d.d.percentile / 100));

    if (sc.showChartXAxisLegend) {
      xAxisRangeLabels.visible.transition()
        .duration(TRANSITION_DURATION)
        .attr('x', xAxisRangeLabelsX)
        .attr('y', xAxisRangeLabelsY)
        .style('opacity', 1);
    } else {
      xAxisRangeLabels.visible.transition()
        .duration(TRANSITION_DURATION)
        .attr('x', xAxisRangeLabelsX)
        .attr('y', xAxisRangeLabelsY)
        .style('opacity', 0);
    }


    // Label above the dots (shown when boxLayout == 'vertical').
    const topChartLabel = createSelections([1], g, 'text', css(styles.topChartLabel));
    topChartLabel.exit.remove();

    const topChartLabelX = xScale.range()[0] + (xScale.range()[1] - xScale.range()[0]) / 2;
    const topChartLabelY = yScale.range()[0] - 20;

    topChartLabel.enter
      .attr('x', topChartLabelX)
      .attr('y', topChartLabelY)
      .style('text-anchor', 'middle')
      .style('user-select', 'none')
      .style('fill', colorForGender(gender))
      .style('opacity', 0)
      .text(this.props.t(chartLabelTextKey));

    if (sc.boxLayout === 'vertical') {
      topChartLabel.visible.transition()
        .duration(TRANSITION_DURATION)
        .attr('x', topChartLabelX)
        .attr('y', topChartLabelY)
        .style('opacity', 1);
    } else {
      topChartLabel.visible.transition()
        .duration(TRANSITION_DURATION)
        .attr('x', topChartLabelX)
        .attr('y', topChartLabelY)
        .style('opacity', 0);
    }

    // Label below the line (more like a chart label)
    const bottomChartLabel = createSelections([1], g, 'text', css(styles.bottomChartLabel));
    bottomChartLabel.exit.remove();

    const bottomChartLabelX = xScale.range()[0] + (xScale.range()[1] - xScale.range()[0]) / 2;
    const bottomChartLabelY = yScale.range()[0] + 50;

    bottomChartLabel.enter
      .attr('x', bottomChartLabelX)
      .attr('y', bottomChartLabelY)
      .style('text-anchor', 'middle')
      .style('user-select', 'none')
      .style('opacity', 0)
      .text(this.props.t(chartLabelTextKey));

    if (sc.showChartXAxisLegend) {
      bottomChartLabel.visible.transition()
        .duration(TRANSITION_DURATION)
        .attr('x', bottomChartLabelX)
        .attr('y', bottomChartLabelY)
        .style('opacity', 1);
    } else {
      bottomChartLabel.visible.transition()
        .duration(TRANSITION_DURATION)
        .attr('x', bottomChartLabelX)
        .attr('y', bottomChartLabelY)
        .style('opacity', 0);
    }
  }

  updateHighlights(sc, g, gender, data, xScale, yScale, category, valueForHighlight) {
    const {hoverPercentile} = this.state;

    const hovers = [];
    if (sc.allowHighlight && hoverPercentile !== undefined && this.state.category === category) {
      const hover = data.find(d => +d.percentile === hoverPercentile);
      if (hover) {
        hovers.push({
          value: hover.value,
          x: xScale(+hover.percentile)
        });
      }
    }

    const cy = sc.dotYPosition === 'fixed'
      ? () => yScale.range()[0]
      : d => yScale(+d.value);

    const bar = createSelections(hovers, g, 'line', 'bar');
    bar.exit.remove();
    bar.visible
      .attr('x1', d => d.x)
      .attr('x2', d => d.x)
      .attr('y1', cy)
      .attr('y2', yScale.range()[0])
      .attr('stroke', colorForGender(gender))
      .attr('stroke-width', 3)
      .style('pointer-events', 'none');

    const circle = createSelections(hovers, g, 'circle', 'circle');
    circle.exit.remove();
    circle.visible
      .attr('r', 6.5)
      .attr('cx', d => d.x)
      .attr('cy', cy)
      .attr('fill', white)
      .attr('stroke', colorForGender(gender))
      .attr('stroke-width', 2)
      .style('pointer-events', 'none');

    const userData = [];
    if (sc.allowHighlight && valueForHighlight !== undefined) {
      userData.push({
        value: valueForHighlight,
        x: getUserX(valueForHighlight, data, xScale)
      });
    }

    const userCircle = createSelections(userData, g, 'circle', 'highlight');
    userCircle.exit.remove();
    userCircle.visible
      .raise()
      .attr('r', 6.5)
      .attr('fill', 'transparent')
      .attr('stroke', black)
      .attr('stroke-width', 2)
      .style('pointer-events', 'none');

    if (!this.isInitialRender) {
      userCircle.enter
        .attr('cx', d => d.x)
        .attr('cy', cy);
    }
    const subject = this.isInitialRender
      ? userCircle.visible
      : userCircle.visible.transition().duration(TRANSITION_DURATION);

    subject
      .attr('cx', d => d.x)
      .attr('cy', cy);
  }

  updateBottomBar(sc, g, gender, data, xScale, yScale, userValue) {
    let higherData = [];
    let lowerData = [];
    if (userValue !== undefined && sc.showBottomBar) {
      const {lower, higher} = getLowerAndHigher(5, data, userValue);
      lowerData = [lower];
      higherData = [100 - higher];
    }

    const xl = xScale.range()[0] - 3;
    const xr = last(xScale.range()) + 3;
    const x = d => Math.min(xr - 8, Math.max(xl + 8, xScale(d)));
    const top = yScale.range()[0] + 80;

    const left = createSelections(lowerData, g, 'path', 'left');
    left.exit.remove();
    left.enter.style('opacity', 0);
    left.visible
      .attr('d', d => {
        if (!d) {
          return 'M0,0 Z';
        }
        return `M${xl} ${top} L${x(d) - 5} ${top} L${x(d) - 1} ${top - 4} L${x(d) - 5} ${top - 8} L${xl} ${top - 8} Z`;
      })
      .attr('fill', colorForGender(gender))
      .transition()
        .duration(TRANSITION_DURATION)
        .style('opacity', 1);

    const right = createSelections(higherData, g, 'path', 'right');
    right.exit.remove();
    right.enter.style('opacity', 0);
    right.visible
      .attr('d', d => {
        if (d === 100) {
          return 'M0,0 Z';
        }
        return `M${xr} ${top} L${x(d) + 5} ${top} L${x(d) + 1} ${top - 4} L${x(d) + 5} ${top - 8} L${xr} ${top - 8} Z`;
      })
      .attr('fill', colorForGender(gender))
      .transition()
        .duration(TRANSITION_DURATION)
        .style('opacity', 1);
  }

  updateInteractionLayer(sc, g, data, xScale, yScale, category) {
    const {isInterleaved} = this.props;

    // How much larger the interaction layer rectangle is on the vertical
    // axis than the chart itself.
    const verticalOverlap = 100;

    // Overlap along the horizontal axis.
    const horizontalOverlap = Math.min(innerPadding(isInterleaved) / 2, BOX_OUTER_HORIZONTAL_PADDING);

    const find = () => {
      const [x, y] = mouse(g.node());
      const distance = d => Math.abs(xScale(+d.percentile) - x);

      const closest = data.reduce((previousValue, currentValue) => {
        return distance(currentValue) < distance(previousValue)
          ? currentValue : previousValue;
      }, data[0]);

      return y + verticalOverlap > yScale(+closest.value) ? closest : undefined;
    };

    const blur = () => {
      if (this.state.hoverPercentile !== undefined || this.state.category !== category) {
        this.setState({hoverPercentile: undefined, category: undefined});
      }
    };

    const focus = () => {
      const hit = find();

      if (hit) {
        if (this.state.hoverPercentile !== +hit.percentile || this.state.category !== category) {
          this.setState({hoverPercentile: +hit.percentile, category});
        }
      } else {
        blur();
      }
    };

    const y0 = last(yScale.range());
    const y1 = yScale.range()[0];
    const w = last(xScale.range()) - xScale.range()[0];

    g
      .attr('x', xScale.range()[0] - horizontalOverlap)
      .attr('width', w + 2 * horizontalOverlap)
      .attr('y', Math.max(0, y0 - verticalOverlap))
      .attr('height', (y1 - y0) + 2 * verticalOverlap)
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
  }


  update() {
    const {isInterleaved, width, stage} = this.props;
    const data = this.dataSource();
    const height = this.height();

    this.updateMaleBox(multiplePercentilesVisualizationStages[stage], isInterleaved, data, width, height);
    this.updateFemaleBox(multiplePercentilesVisualizationStages[stage], isInterleaved, data, width, height);
  }


  dataForTooltips(findDatum) {
    const {width, t, stage} = this.props;
    const sc = multiplePercentilesVisualizationStages[stage];
    const data = this.dataSource();
    const height = this.height();

    if (!sc.showTooltips) {
      return [];
    }

    const tooltipsForGender = (gender, pos) => {
      const yScale = this.yScale(data, pos);
      const {leftXScale, rightXScale} = this.xScales(data, gender, pos);

      function datumForCategory(category, xScale) {
        const dataForCategory = data.filter(x => x.gender === gender && x.category === category);
        return mapMaybe(findDatum(gender, category, dataForCategory), ({d, placementPreferences}) => {
          return {
            d,
            x: d.user ? getUserX(+d.value, dataForCategory, xScale) : xScale(+d.percentile),
            yScale,
            text: `${hourFormat(+d.value)} ${t('flagship/working-hours/unit')}`,
            title: !d.user && t('flagship/percentiles/percentile-label', {percentile: d.percentile}),
            placementPreferences
          };
        });
      }

      return [
        datumForCategory(CATEGORY_DESIRED_WORKING_HOURS, leftXScale),
        datumForCategory(CATEGORY_ACTUAL_WORKING_HOURS, rightXScale)
      ];
    };

    return [].concat.apply([], [
      tooltipsForGender(GENDER_MALE, this.maleBoxPosition(sc, width, height)),
      tooltipsForGender(GENDER_FEMALE, this.femaleBoxPosition(sc, width, height))
    ]).filter(x => x !== undefined);
  }

  // Return a list of {d, xScale, yScale} which describe all the tooltips
  // which should be shown. 'd' is the item from the 'data' array, xScale and
  // yScale can be used to calculate the exact position on the screen.
  tooltipData() {
    const {stage, desiredWorkingHours, actualWorkingHours, tooltips} = this.props;
    const {hoverPercentile} = this.state;
    const sc = multiplePercentilesVisualizationStages[stage];

    if (!sc.showTooltips) {
      return [];
    }

    return this.dataForTooltips((gender, category, data) => {
      const placementPreferences = {forceTop: true};

      // Hover has precedence, but only if in the same category.
      if (hoverPercentile !== undefined && this.state.category === category) {
        return mapMaybe(data.find(x => +x.percentile === hoverPercentile), d => {
          return {d, placementPreferences};
        });
      }

      // Else highlight the datum which matches the user-supplied working
      // hours.
      const userValue = ({
        [CATEGORY_DESIRED_WORKING_HOURS]: desiredWorkingHours,
        [CATEGORY_ACTUAL_WORKING_HOURS]: actualWorkingHours,
      })[category];

      if (tooltips === 'user' && userValue) {
        return {
          d: {user: true, value: userValue},
          placementPreferences
        };
      }
      return undefined;
    });
  }

  renderTooltips() {
    const {width, stage} = this.props;
    const sc = multiplePercentilesVisualizationStages[stage];

    return this.tooltipData().map(({d, x, yScale, text, title, placementPreferences}, index) => {
      const top = sc.dotYPosition === 'fixed'
        ? yScale.range()[0]
        : yScale(+d.value);

      return (
        <Tooltip key={index}
          boundingRect={{
            left: x - 7,
            top: top - 7,
            width: 14,
            height: 14,
          }}
          contextRect={{left: 0, width, top: 0}}
          placementPreferences={placementPreferences}>
          {title}
          {!!title && <br />}
          {text}
        </Tooltip>
      );
    });
  }


  renderBottomBar() {
    const {width, stage} = this.props;
    const sc = multiplePercentilesVisualizationStages[stage];
    const height = this.height();

    if (!sc.showBottomBar) {
      return null;
    }

    return (
      <div>
        {this.renderBottomBarForGender(GENDER_MALE, this.maleBoxPosition(sc, width, height))}
        {this.renderBottomBarForGender(GENDER_FEMALE, this.femaleBoxPosition(sc, width, height))}
      </div>
    );
  }

  renderBottomBarForGender(gender, pos) {
    const {actualWorkingHours, desiredWorkingHours} = this.props;
    const data = this.dataSource();

    const yScale = this.yScale(data, pos);
    const {leftXScale, rightXScale} = this.xScales(data, gender, pos);

    return (
      <div>
        {this.renderBottomBarForChart(gender, data, yScale, leftXScale, CATEGORY_DESIRED_WORKING_HOURS, desiredWorkingHours)}
        {this.renderBottomBarForChart(gender, data, yScale, rightXScale, CATEGORY_ACTUAL_WORKING_HOURS, actualWorkingHours)}
      </div>
    );
  }

  renderBottomBarForChart(gender, data, yScale, xScale, category, workingHours) {
    const {t, stage} = this.props;
    const sc = multiplePercentilesVisualizationStages[stage];

    if (!sc.showBottomBar || workingHours === undefined) {
      return null;
    }

    const dataForChart = data.filter(x =>
      x.gender === gender && x.category === category);

    const {
      lower,
      higher
    } = getLowerAndHigher(5, dataForChart, workingHours);

    const top = yScale.range()[0] + 90;
    const left = xScale.range()[0];
    const width = last(xScale.range()) - xScale.range()[0];

    const lowerLabel = ({
      [CATEGORY_DESIRED_WORKING_HOURS]: 'flagship/multiple-percentiles/wish-less',
      [CATEGORY_ACTUAL_WORKING_HOURS]: 'flagship/multiple-percentiles/work-less',
    })[category];

    const higherLabel = ({
      [CATEGORY_DESIRED_WORKING_HOURS]: 'flagship/multiple-percentiles/wish-more',
      [CATEGORY_ACTUAL_WORKING_HOURS]: 'flagship/multiple-percentiles/work-more',
    })[category];

    return (
      <div className={css(styles.bottomBar)} style={{top, left, width}}>
        {lower > 0 && (<div className={css(styles.bottomBarLeft)} style={{color: colorForGender(gender)}}>
          <div className={css(styles.bottomBarTop)}>
            {percentFormat(lower / 100)}
          </div>
          <div className={css(styles.bottomBarBottom)}>
            {highlight(t(lowerLabel), /\*\*([^\*]+)\*\*/, css(styles.bottomBarLabelString))}
          </div>
        </div>)}
        {higher > 0 && (<div className={css(styles.bottomBarRight)} style={{color: colorForGender(gender)}}>
          <div className={css(styles.bottomBarTop)}>
            {percentFormat(higher / 100)}
          </div>
          <div className={css(styles.bottomBarBottom)}>
            {highlight(t(higherLabel), /\*\*([^\*]+)\*\*/, css(styles.bottomBarLabelString))}
          </div>
        </div>)}
      </div>
    );
  }


  render() {
    const {width} = this.props;
    const height = this.height();

    return (
      <div ref={this.rootRef} style={{position: 'relative', width, height}}>
        <svg ref={this.svgRef} style={{width, height}}>
          <g className='male-icon'><MaleIcon /></g>
          <g className='female-icon'><FemaleIcon /></g>
        </svg>

        {this.renderBottomBar()}
        {this.renderTooltips()}
      </div>
    );
  }
}

MultiplePercentilesVisualization.propTypes = {
  t: PropTypes.func.isRequired,

  isInterleaved: PropTypes.bool.isRequired,

  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,

  stage: PropTypes.oneOf(Object.keys(multiplePercentilesVisualizationStages)).isRequired,
  tooltips: PropTypes.string,

  dimensionId: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,

  desiredWorkingHours: PropTypes.number,
  actualWorkingHours: PropTypes.number,
};
