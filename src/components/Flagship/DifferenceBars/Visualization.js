import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {select, mouse, event} from 'd3-selection';
import 'd3-transition';
import {nest} from 'd3-collection';
import {scaleLinear, scaleQuantize, scalePoint} from 'd3-scale';
import {geoPath} from 'd3-geo';
import {range, extent, ascending} from 'd3-array';
import {defaultMemoize as memoize} from 'reselect';
import {format} from 'd3-format';
import {StyleSheet, css} from 'aphrodite';

import {Tooltip} from 'components/Tooltip/Tooltip';
import ColorLegend from 'components/Chart/ColorLegend';

import {sansRegular12} from 'theme/typeface';
import {white, midGrey, userHighlight} from 'theme/constants';

import {dimensionSchemes} from 'utils/dimension';
import {getProjection} from 'utils/projection';
import {shallowEqual} from 'utils/shallowEqual';
import {mapMaybe, maybeToList} from 'utils/maybe';

import ArrowLeft from 'components/Icons/ArrowLeft.icon.svg';
import ArrowRight from 'components/Icons/ArrowRight.icon.svg';

const MAX_LEGEND_WIDTH = 160;

const TRANSITION_DURATION = 650;
const QUICK_TRANSITION_DURATION = 120;

const normalizeKrsId = format('05');

const styles = StyleSheet.create({
  chartLabel: {
    ...sansRegular12,
    fill: midGrey,
  },
  startYearLegendLabel: {
    ...sansRegular12,
    fill: midGrey,
  },
  endYearLegendLabel: {
    ...sansRegular12,
    fill: midGrey,
  },
  xAxis: {
    ...sansRegular12,
    color: midGrey,
    position: 'absolute',
    bottom: 15,
    left: 10,
    right: 10,
    transition: 'opacity 400ms'
  },
  mapPaths: {
    stroke: 'white',
    fill: 'transparent',
    strokeLinejoin: 'round',
    userSelect: 'none',
    '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
  },
  interactionLayer: {
    fill: 'transparent',
    userSelect: 'none',
    '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
  }
});

// All the different stages we can show. They all can be viewed in the catalog.
// The ScrollBlock stage parameter determines which one is shown.
//
// This object maps the stage name to a set of internal properties which are
// used to lay out the DOM elements in the SVG.

// - view :: 'map' | 'chart'
//   Show the map full-screen ('map') or the map and the chart arraged
//   vertically ('chart').

// - endValueDotRadius :: Number
//   The radius of the end value dot.

// - startValueDotRadius :: Number
//   The radius of the start value dot.

// - showBars :: Boolean
//   Whether to show the bars between the start and end value dot. This only
//   maks sense if view === 'chart' (and both dot radii are > 0), but we don't
//   enforce that in the code.

// - tooltipPosition :: 'map' | 'endValueDot'
//   Where to show the tooltip. Either around the district on the map or
//   above / under the end value dot in the chart.

// - tooltipText :: 'districtName' | 'districtNameAndChange'
//   The text to show in the tooltip. Either just the district name, or the
//   name and the change in the value between the start and end value.

// - showDifferenceInTooltip :: Boolean
//   Whether to show the difference between start and end value in the tooltip.
//   This depends on the stage, because we do not want to show the difference
//   until we actually show the start value dots and explain the increase in
//   life expectancy in the text.

export const districtsVisualizationStages = {
  choropleth: {
    view: 'map',
    endValueDotRadius: 0,
    startValueDotRadius: 0,
    showBars: false,
    tooltipPosition: 'map',
    tooltipText: 'districtName',
    showDifferenceInTooltip: false,
  },
  dots: {
    view: 'map',
    endValueDotRadius: 2,
    startValueDotRadius: 0,
    showBars: false,
    tooltipPosition: 'map',
    tooltipText: 'districtName',
    showDifferenceInTooltip: false,
  },
  endValue: {
    view: 'chart',
    endValueDotRadius: 1.5,
    startValueDotRadius: 0,
    showBars: false,
    tooltipPosition: 'endValueDot',
    tooltipText: 'districtName',
    showDifferenceInTooltip: false,
  },
  values: {
    view: 'chart',
    endValueDotRadius: 1.5,
    startValueDotRadius: 1.5,
    showBars: false,
    tooltipPosition: 'endValueDot',
    tooltipText: 'districtNameAndChange',
    showDifferenceInTooltip: true,
  },
  difference: {
    view: 'chart',
    endValueDotRadius: 1.5,
    startValueDotRadius: 1.5,
    showBars: true,
    tooltipPosition: 'endValueDot',
    tooltipText: 'districtNameAndChange',
    showDifferenceInTooltip: true,
  },
};

function toString(x) {
  return '' + x;
}

const MAP_PADDING = 10;

const getGeoPaths = memoize((geoJson, x, y, width, height) => {
  const projection = getProjection();
  projection.fitExtent([[x, y], [x + width, y + height]], geoJson);
  const bigGeoPath = geoPath().projection(projection);

  const features = geoJson.features.reduce((index, feature) => {
    index[normalizeKrsId(feature.id)] = {
      centroid: bigGeoPath.centroid(feature),
      bounds: memoize(() => bigGeoPath.bounds(feature)),
      path: bigGeoPath(feature),
    };
    return index;
  }, {});

  return {
    features,
    bounds: bigGeoPath.bounds(geoJson),
  };
});

function fadeOutSelection(sel) {
  return sel.transition().duration(QUICK_TRANSITION_DURATION)
    .style('opacity', 0);
}
function fadeIn(o) {
  o.enter.style('opacity', 0);
  o.visible.transition().duration(QUICK_TRANSITION_DURATION)
    .style('opacity', 1);
}

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

export class DistrictsVisualization extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // The district which should be highlighted due to user hovering over it
      // on the map or in the chart.
      hoverDistrictKey: undefined,

      // The actual district with the 'hoverDistrictKey' in the data set.
      // May be undefined even if 'hoverDistrictKey' is set if no such district
      // exists in the data set.
      hoverDistrict: undefined,
    };

    this.onHoverDistrict = hoverDistrictKey => {
      const hoverDistrict = this.data().find(x => x.key === hoverDistrictKey);
      this.setState({hoverDistrictKey, hoverDistrict});
    };


    this.root = undefined;
    this.rootSelection = undefined;
    this.rootRef = ref => { this.root = ref; };

    this.svg = undefined;
    this.svgSelection = undefined;
    this.svgRef = ref => { this.svg = ref; };


    // The area (x, y, width, height) within which the map may be placed. The
    // actual size will be smaller so that the map fits into this box.
    this.mapBox = memoize((isInterleaved, canvasWidth, canvasHeight, reservedTextWidth) => {
      // We can use the full height of the canvas (use less to leave a bit
      // padding on top and bottom).
      const height = Math.floor(canvasHeight * 0.8);

      const leftPadding = reservedTextWidth;

      // The rest of the horizontal space is used by the map.
      const width = canvasWidth - leftPadding - 2 * MAP_PADDING;

      return {
        x: leftPadding + MAP_PADDING,
        y: (canvasHeight - height) / 2,
        width,
        height
      };
    });

    this.mapFeatures = memoize((isInterleaved, canvasWidth, canvasHeight, reservedTextWidth, geoJson) => {
      const {x, y, width, height} = this.mapBox(isInterleaved, canvasWidth, canvasHeight, reservedTextWidth);
      return getGeoPaths(geoJson, x, y, width, height);
    });

    this.nestedDataFn = memoize((districtData, startYear, endYear) => {
      return nest()
        .key(d => normalizeKrsId(d.krs))
        .rollup(values => {
          const startItem = values.find(d => d.year === startYear);
          const endItem = values.find(d => d.year === endYear);

          if (startItem !== undefined && endItem !== undefined) {
            return {
              start: +values.find(d => d.year === startYear).value,
              end: +values.find(d => d.year === endYear).value,
              all: values
            };
          }

          console.warn('dataFn: could not find item start or end year'); // eslint-disable-line
          return undefined;
        })
        .entries(districtData)
        .filter(d => d.value !== undefined)
        .sort((a, b) => ascending(a.value.end, b.value.end))
        .map((d, index, all) => {
          d.valueSort = index / all.length;
          return d;
        });
    });
    this.dataWithGeoFn = memoize((districtData, startYear, endYear, isInterleaved, width, height, reservedTextWidth, geoJson) => {
      const {features} = this.mapFeatures(isInterleaved, width, height, reservedTextWidth, geoJson);
      const nestedData = this.nestedDataFn(districtData, startYear, endYear);

      nestedData.forEach(d => {
        d.geo = features[d.key];
      });

      return [].concat(nestedData);
    });

    this.xScaleFn = memoize((data, padding, width) => {
      return scalePoint()
        .domain(range(data.length))
        .range([padding.left, width - padding.right]);
    });

    this.yScaleFn = memoize((data, padding, height, barsHeight) => {
      return scaleLinear()
        .domain(extent(data.reduce((values, d) => {
          values.push(d.value.start);
          values.push(d.value.end);
          return values;
        }, [])))
        .range([height - padding.bottom, height - padding.bottom - barsHeight + padding.top]);
    });

    this.choroplethFn = memoize((data, dimensionId) => {
      return scaleQuantize()
        .domain(extent(data.map(d => d.value.end)))
        .range(
          dimensionSchemes(dimensionId).sequential
            .slice(1) // we remove the brightest color as it does not have enough contrast as a dot
        );
    });

    this.mapWidth = memoize((bounds, scaleFactor) => {
      return (bounds[1][0] - bounds[0][0]) * scaleFactor;
    });
    this.mapHeight = memoize((bounds, scaleFactor) => {
      return (bounds[1][1] - bounds[0][1]) * scaleFactor;
    });

    this.mapScaleFactor = memoize((isInterleaved, view, width, height, reservedTextWidth, mapHeight, bounds) => {
      if (view === 'map') {
        return 1;
      }

      const actualMapWidth = bounds[1][0] - bounds[0][0];
      const actualMapHeight = bounds[1][1] - bounds[0][1];

      // Scale the map down to fit into the top right corner of the SVG,
      // into a block which is at most 'mapHeight' tall and leaves enough
      // horizontal space for the legend and scrolling text.
      const extraHorizontalSpace = reservedTextWidth;
      const scaleFactorX = (width - MAX_LEGEND_WIDTH - extraHorizontalSpace) / actualMapWidth;
      const scaleFactorY = mapHeight / actualMapHeight;

      return Math.min(scaleFactorX, scaleFactorY);
    });

    // The transform of the map area, as scale and translate{X,Y}. Note:
    // translate{X,Y} are pre-multiplied with the scale! When applying this
    // transform, first scale, then translate.
    this.mapTransform = memoize((isInterleaved, view, width, height, reservedTextWidth, mapHeight, bounds) => {
      if (view === 'map') {
        return {scale: 1, translateX: 0, translateY: 0};
      }

      const actualMapWidth = bounds[1][0] - bounds[0][0];
      const actualMapHeight = bounds[1][1] - bounds[0][1];

      // Scale the map down to fit into the top right corner of the SVG,
      // into a block which is at most 'mapHeight' tall and leaves enough
      // horizontal space for the legend and scrolling text.
      const extraHorizontalSpace = reservedTextWidth;
      const scaleX = (width - MAX_LEGEND_WIDTH - extraHorizontalSpace - MAP_PADDING) / actualMapWidth;
      const scaleY = mapHeight / actualMapHeight;

      const scale = Math.min(scaleX, scaleY);

      const translateX = width / scale - bounds[1][0] - MAP_PADDING;
      const translateY = -bounds[0][1];

      return {scale, translateX, translateY};
    });

    this.updateMapArea = memoize((mapArea, isInterleaved, view, width, height, reservedTextWidth, mapHeight, bounds) => {
      const {scale, translateX, translateY} = this.mapTransform(isInterleaved,
        view, width, height, reservedTextWidth, mapHeight, bounds);

      const subject = this.isInitialRender
        ? mapArea
        : mapArea.transition().duration(TRANSITION_DURATION);
      subject.attr('transform', `scale(${scale} ${scale}) translate(${translateX} ${translateY})`);
    });

    this.updateMap = memoize((data, mapArea, onHoverDistrict) => {
      const map = createSelections(data, mapArea, 'path', 'map-path');
      map.enter.classed(css(styles.mapPaths), 1);

      map.visible
        .attr('d', d => d.geo.path)
        .on('touchstart', d => onHoverDistrict(d.key))
        .on('touchend', () => onHoverDistrict(undefined))
        .on('mouseenter', d => onHoverDistrict(d.key))
        .on('mouseleave', () => onHoverDistrict(undefined));
    });

    this.updateMapFill = memoize((data, highlightedDistricts, mapArea, choropleth) => {
      const fill = !highlightedDistricts
        ? d => choropleth(d.value.end)
        : d => d.highlighted ? choropleth(d.value.end) : '#ddd';

      const map = createSelections(data, mapArea, 'path', 'map-path');
      map.enter.classed(css(styles.mapPaths), 1);

      const subject = this.isInitialRender
        ? map.visible
        : map.visible.transition().duration(TRANSITION_DURATION);
      subject.style('fill', fill);
    });

    this.updateMapHover = memoize((data, mapArea, hoverDistrict, mapScaleFactor) => {
      const hover = createSelections(maybeToList(hoverDistrict), mapArea,
        'path', 'map-path-hover');

      fadeOutSelection(hover.exit);
      fadeIn(hover);
      hover.enter
        .attr('fill', 'transparent')
        .attr('stroke', 'black')
        .attr('stroke-linejoin', 'round')
        .style('pointer-events', 'none');
      hover.visible
        .attr('d', d => d.geo.path)
        .style('stroke-width', '' + (1.5 / mapScaleFactor) + 'px');
    });

    this.updateMapPersonalization = memoize((data, mapArea, homeDistrict, mapScaleFactor) => {
      const home = createSelections(maybeToList(homeDistrict), mapArea,
        'path', 'map-path-home');

      fadeOutSelection(home.exit).remove();
      fadeIn(home);
      home.enter
        .attr('fill', 'transparent')
        .attr('stroke', userHighlight)
        .attr('stroke-linejoin', 'round')
        .style('pointer-events', 'none');
      home.visible
        .attr('d', d => d.geo.path)
        .style('stroke-width', '' + (1.5 / mapScaleFactor) + 'px');
    });

    this.updateBarsLegend = memoize((g, data, isInterleaved, view, endValueDotRadius, startValueDotRadius, showBars, width, mapWidth, mapHeightInChartView, startYear, endYear, x, y) => {
      const xPos = isInterleaved ? 14 : width - 60 + 4;

      const lastDatum = data[data.length - 1];
      const valueIncreasing = y(lastDatum.value.start) > y(lastDatum.value.end);

      const {startY, endY} = isInterleaved
        ? {startY: mapHeightInChartView + (valueIncreasing ? +30 : -30), endY: mapHeightInChartView + (valueIncreasing ? -30 : +30)}
        : {startY: y(lastDatum.value.start), endY: y(lastDatum.value.end)};

      const {textAnchor, textOffset} = isInterleaved
        ? {textAnchor: 'start', textOffset: 6}
        : {textAnchor: 'start', textOffset: 6};

      const lineData = isInterleaved && view === 'chart' && endValueDotRadius > 0 && startValueDotRadius > 0 && showBars ? [1] : [0];
      const line = createSelections(lineData, g, 'line', 'bars-legend-line');

      line.exit.remove();
      const lineEnter = line.enter
        .attr('stroke', midGrey)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('x1', xPos)
        .attr('x2', xPos)
        .attr('y1', startY)
        .style('shape-rendering', 'crispEdges')
        .style('pointer-events', 'none');

      if (this.isInitialRender) {
        lineEnter
          .attr('y2', d => d === 1 ? endY : startY);
      } else {
        lineEnter
          .style('opacity', 0)
          .attr('y2', startY);
        line.visible.transition().duration(TRANSITION_DURATION)
          .attr('x1', xPos)
          .attr('x2', xPos)
          .attr('y1', startY)
          .attr('y2', d => d === 1 ? endY : startY);
      }

      const endData = isInterleaved && view === 'chart' && endValueDotRadius > 0 ? [1] : [];
      const end = createSelections(endData, g, 'circle', 'bars-legend-end');
      fadeOutSelection(end.exit).remove();
      fadeIn(end);
      end.enter
        .attr('r', 2)
        .attr('stroke-width', 1)
        .style('pointer-events', 'none');
      end.visible
        .attr('cx', xPos)
        .attr('cy', endY)
        .attr('stroke', midGrey)
        .attr('fill', midGrey);

      const endTextData = view === 'chart' && endValueDotRadius > 0 ? [1] : [];
      const endText = createSelections(endTextData, g, 'text', css(styles.endYearLegendLabel));
      fadeOutSelection(endText.exit).remove();
      fadeIn(endText);
      endText.visible
        .attr('x', xPos + textOffset)
        .attr('y', endY + 3)
        .style('text-anchor', textAnchor)
        .text(toString(endYear));

      const startData = isInterleaved && view === 'chart' && startValueDotRadius > 0 ? [1] : [];
      const start = createSelections(startData, g, 'circle', 'bars-legend-start');
      fadeOutSelection(start.exit).remove();
      fadeIn(start);
      start.enter
        .attr('r', 2)
        .attr('stroke-width', 1)
        .style('pointer-events', 'none');
      start.visible
        .attr('cx', xPos)
        .attr('cy', startY)
        .attr('fill', '#DDDDDD')
        .attr('stroke', '#DDDDDD');

      const startTextData = view === 'chart' && startValueDotRadius > 0 ? [1] : [];
      const startText = createSelections(startTextData, g, 'text', css(styles.startYearLegendLabel));
      fadeOutSelection(startText.exit).remove();
      fadeIn(startText);
      startText.visible
        .attr('x', xPos + textOffset)
        .attr('y', startY + 3)
        .style('text-anchor', textAnchor)
        .text(toString(startYear));
    });

    this.updateChartOverlay = memoize((data, highlightedDistricts, chartOverlay, view, x, y, padding, onHoverDistrict) => {
      const isHoverCandidate = !highlightedDistricts
        ? () => true
        : d => d.highlighted;

      const focus = () => {
        const mouseX = mouse(chartOverlay.node())[0];
        const result = data.reduce(({i, distance}, item, index) => {
          const itemX = x(index);
          if (Math.abs(itemX - mouseX) < distance && isHoverCandidate(item)) {
            return {
              i: index, distance: Math.abs(itemX - mouseX)
            };
          }
          return {i, distance};
        }, {i: 0, distance: Infinity});

        if (result.i >= 0 && result.i < data.length && isHoverCandidate(data[result.i])) {
          onHoverDistrict(data[result.i].key);
        } else {
          onHoverDistrict(undefined);
        }
      };
      const blur = () => onHoverDistrict(undefined);

      chartOverlay
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

      if (view === 'map') {
        chartOverlay.attr('x', 0).attr('y', 0).attr('width', 0).attr('height', 0);
      } else {
        chartOverlay
          .attr('x', () => x(0) - padding.left)
          .attr('y', () => y.range()[1] - padding.top)
          .attr('width', () => (x(data.length - 1) - x(0)) + padding.left + padding.right)
          .attr('height', () => y.range()[0] - y.range()[1] + padding.top + padding.bottom);
      }
    });

    this.updateChartLabels = memoize((g, data, view, x, y, yAxisLabelParameter) => {
      const yAxisLabel = mapMaybe(yAxisLabelParameter, str => {
        const [valueString, text] = str.split(',');
        return {value: parseInt(valueString, 10), text};
      });
      const dataForSelection = maybeToList(view === 'chart' ? yAxisLabel : undefined);

      const line = createSelections(dataForSelection, g, 'line', 'line', d => d.value);
      fadeOutSelection(line.exit).remove();
      fadeIn(line);
      line.visible
        .attr('stroke', midGrey)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .style('shape-rendering', 'crispEdges')
        .attr('x1', () => x(0))
        .attr('x2', () => x(data.length - 1))
        .attr('y1', d => y(d.value))
        .attr('y2', d => y(d.value));

      const label = createSelections(dataForSelection, g, 'text', css(styles.chartLabel), d => d.value);
      fadeOutSelection(label.exit).remove();
      fadeIn(label);
      label.visible
        .attr('x', () => x(0) + 8)
        .attr('y', d => y(d.value) - 6)
        .text(d => d.text);

      const circle = createSelections(dataForSelection, g, 'circle', 'circle', d => d.value);
      fadeOutSelection(circle.exit).remove();
      fadeIn(circle);
      circle.visible
        .attr('cx', () => x(0))
        .attr('cy', d => y(d.value))
        .attr('r', 3.5)
        .attr('stroke', midGrey)
        .attr('fill', white);
    });

    this.padding = memoize((isInterleaved) => ({
      top: 20, right: isInterleaved ? 20 : 60, bottom: 45, left: 20
    }));
  }

  componentDidMount() {
    this.initialRender();
    this.update(true);
  }
  shouldComponentUpdate(nextProps, nextState) {
    this.propsChanged = !shallowEqual(this.props, nextProps);
    return this.propsChanged || !shallowEqual(this.state, nextState);
  }
  componentDidUpdate() {
    this.update();
  }

  mapHeightInChartView() {
    return Math.round(this.props.height * 0.4);
  }

  // When in 'bars' view, the map takes up the top 40% of the vertial space,
  // and the bars below the rest. Between that we leave 4% or 20px padding.
  barsHeight() {
    const {height} = this.props;
    const verticalPaddingBetweenMapAndBars = Math.max(20, Math.round(height * 0.04));
    return height - this.mapHeightInChartView() - verticalPaddingBetweenMapAndBars;
  }


  data() {
    const {
      districtData, isInterleaved, width, height, startYear, endYear,
      geoJson, reservedTextWidth
    } = this.props;

    return this.dataWithGeoFn(districtData, startYear, endYear, isInterleaved, width, height, reservedTextWidth, geoJson);
  }

  bounds() {
    const {isInterleaved, width, height, reservedTextWidth, geoJson} = this.props;
    return this.mapFeatures(isInterleaved, width, height, reservedTextWidth, geoJson).bounds;
  }

  xScale() {
    return this.xScaleFn(this.data(), this.padding(this.props.isInterleaved), this.props.width);
  }

  yScale() {
    return this.yScaleFn(this.data(), this.padding(this.props.isInterleaved), this.props.height, this.barsHeight());
  }

  choropleth() {
    return this.choroplethFn(this.data(), this.props.dimensionId);
  }


  // Called once after the component is mounted and the SVG DOM element created.
  // Here we set up all the static SVG elements and also create selections.
  initialRender() {
    this.rootSelection = select(this.root);
    const svg = this.svgSelection = select(this.svg);

    this.mapArea = svg.append('g').classed('map', 1);
    this.mapPaths = this.mapArea.append('g').classed('paths', 1);
    this.mapAreaPersonalization = this.mapArea.append('g').classed('personalization', 1);
    this.mapAreaOverlay = this.mapArea.append('g').classed('overlay', 1);

    this.chartArea = svg.append('g').classed('chart', 1);
    this.chartBase = this.chartArea.append('g').classed('base', 1).style('pointer-events', 'none');
    this.chartLabels = this.chartArea.append('g').classed('labels', 1);
    this.chartOverlay = this.chartArea.append('rect').attr('class', css(styles.interactionLayer));
  }

  update(initialRender) {
    const {isInterleaved, width, height, reservedTextWidth, stage, parameters,
      userDistrictId, startYear, endYear} = this.props;
    const {hoverDistrict, hoverDistrictKey} = this.state;
    const {view, startValueDotRadius, endValueDotRadius, showBars}
      = districtsVisualizationStages[stage];

    // -------------------------------------------------------------------------
    // Computing various values using memoized functions.

    const isMap = view === 'map';
    const districts = this.data();
    const highlightedDistricts = !!parameters.highlights && String(parameters.highlights).split(',');
    districts.forEach(d => {
      d.user = d.key === userDistrictId;
      d.highlighted = (
        highlightedDistricts &&
        highlightedDistricts.some(prefix => d.key.startsWith(prefix))
      );
      d.chartHover = !isMap && d.key === hoverDistrictKey;
      d.sort = d.chartHover * 8 + d.highlighted * 4 + d.user * 2 + d.valueSort;
    });

    const x = this.xScale();
    const y = this.yScale();
    const choropleth = this.choropleth();
    const bounds = this.bounds();
    const mapHeightInChartView = this.mapHeightInChartView();
    const mapScaleFactor = this.mapScaleFactor(isInterleaved, view, width,
      height, reservedTextWidth, mapHeightInChartView, bounds);
    const mapWidth = this.mapWidth(bounds, mapScaleFactor);

    const homeDistrict = districts.find(d => d.key === userDistrictId);

    // -------------------------------------------------------------------------
    // Memoized updates

    this.isInitialRender = initialRender;
    this.updateMapArea(this.mapArea, isInterleaved, view, width, height, reservedTextWidth, mapHeightInChartView, bounds);
    this.updateMap(districts, this.mapPaths, this.onHoverDistrict);
    this.updateMapFill(districts, parameters.highlights, this.mapPaths, choropleth);
    this.updateMapPersonalization(districts, this.mapAreaPersonalization, homeDistrict, mapScaleFactor);
    this.updateMapHover(districts, this.mapAreaOverlay, hoverDistrict, mapScaleFactor);

    this.updateChartOverlay(districts, parameters.highlights, this.chartOverlay, view, x, y, this.padding(isInterleaved), this.onHoverDistrict);

    this.updateChartLabels(this.chartLabels, districts, view, x, y, parameters.yAxisLabel);
    this.updateBarsLegend(this.chartLabels, districts, isInterleaved, view,
      endValueDotRadius, startValueDotRadius, showBars, width, mapWidth,
      mapHeightInChartView, startYear, endYear, x, y);

    // -------------------------------------------------------------------------
    // Regular updates

    if (this.propsChanged || initialRender) {
      this.renderChart(initialRender);
    }
    this.renderChartHighlights();
  }

  renderChart(initialRender) {
    const districts = this.data();
    const {stage} = this.props;
    const {
      view, showBars,
      startValueDotRadius
    } = districtsVisualizationStages[stage];
    const x = this.xScale();
    const y = this.yScale();

    const getX = view === 'map' ? d => d.geo.centroid[0] : (d, i) => x(i);

    const districtGroupSelection = this.chartBase.selectAll('g').data(districts, d => d.key);
    const districtGroupsEnter = districtGroupSelection.enter().append('g')
      .attr('transform', (d, i) => `translate(${getX(d, i)},0)`);
    const districtGroups = this.districtGroups = districtGroupSelection.merge(districtGroupsEnter);

    if (!initialRender) {
      districtGroups.transition().duration(TRANSITION_DURATION)
        .attr('transform', (d, i) => `translate(${getX(d, i)},0)`);
    }

    const lines = districtGroups.selectAll('line').data(showBars ? (d => [d]) : []);
    lines.exit().transition().duration(TRANSITION_DURATION).attr('y2', d => y(d.value.start)).remove();
    const linesEnter = lines.enter().append('line')
      .lower()
      .attr('stroke-width', 1)
      .style('shape-rendering', 'crispEdges');
    this.lines = lines.merge(linesEnter)
      .attr('y1', d => y(d.value.start));

    if (initialRender) {
      this.lines.attr('y2', d => y(d.value.end));
    } else {
      linesEnter
        .style('opacity', 0)
        .attr('y2', d => y(d.value.start));
      this.lines
        .transition().duration(TRANSITION_DURATION)
          .attr('y2', d => y(d.value.end))
          .style('opacity', 1);
    }

    const endY = view === 'map' ? d => d.geo.centroid[1] : d => y(d.value.end);
    const endDotSelection = districtGroups.selectAll('circle.end').data(d => [d]);
    endDotSelection.exit().remove();
    const endDotsEnter = endDotSelection.enter().append('circle')
      .classed('end', 1)
      .attr('r', 0)
      .attr('cy', endY);
    const endDots = this.endDots = endDotSelection.merge(endDotsEnter);

    if (!initialRender) {
      endDots.transition()
        .duration(TRANSITION_DURATION)
        .attr('cy', endY);
    }

    const startY = view === 'map' ? d => d.geo.centroid[1] : d => y(d.value.start);
    const startDotSelection = districtGroups.selectAll('circle.start').data(startValueDotRadius ? (d => [d]) : []);
    startDotSelection.exit().transition().duration(QUICK_TRANSITION_DURATION).style('opacity', 0).remove();
    const startDotsEnter = startDotSelection.enter().append('circle')
      .classed('start', 1)
      .attr('r', 0)
      .attr('cy', startY);
    const startDots = this.startDots = startDotSelection.merge(startDotsEnter);

    if (!initialRender) {
      startDots.transition()
        .duration(TRANSITION_DURATION)
        .attr('cy', startY);
    }
  }
  renderChartHighlights() {
    const {stage, parameters} = this.props;
    const {
      view,
      endValueDotRadius,
      startValueDotRadius
    } = districtsVisualizationStages[stage];
    const choropleth = this.choropleth();

    const hasHighlights = !!parameters.highlights;
    const isMap = view === 'map';

    let lineColor;
    if (hasHighlights) {
      lineColor = d => d.highlighted ? choropleth(d.value.end) : '#ddd';
    } else {
      lineColor = d => choropleth(d.value.end);
    }

    this.districtGroups.sort((a, b) => ascending(a.sort, b.sort));

    this.lines
      .attr('stroke', lineColor)
      .attr('stroke-width', d => d.chartHover ? 3 : 1);

    this.endDots
      .attr('stroke', lineColor)
      .attr('stroke-width', d => {
        if (d.chartHover) return 3;
        return d.highlighted ? 2 : 0;
      })
      .attr('r', d => {
        if (d.chartHover && endValueDotRadius) return 6.5;
        return (d.highlighted || d.user) ? 3 : endValueDotRadius;
      })
      .attr('fill', d => {
        if (!isMap && d.user) return userHighlight;
        if (d.chartHover || d.highlighted) return 'white';
        return hasHighlights ? '#ddd' : choropleth(d.value.end);
      });
    this.startDots
      .attr('stroke', lineColor)
      .attr('stroke-width', d => (d.chartHover || d.highlighted) ? 1.5 : 0)
      .attr('r', d => {
        if (d.chartHover && startValueDotRadius) return 3.5;
        return d.highlighted ? 2 : startValueDotRadius;
      })
      .attr('fill', d => (d.chartHover || d.highlighted) ? 'white' : '#ddd');
  }

  // The legend is placed either just left of the map (when non-interleaved)
  // or on the left edge of the canvas (when interleaved). In either case,
  // the legend is vertically centered to the map height.
  legendStyle() {
    const {isInterleaved, stage, width, height, reservedTextWidth} = this.props;
    const {view} = districtsVisualizationStages[stage];
    const bounds = this.bounds();

    const mapScaleFactor = this.mapScaleFactor(isInterleaved, view, width,
      height, reservedTextWidth, this.mapHeightInChartView(), this.bounds());

    const isVisible = view === 'chart';
    const {visibility, opacity} = isVisible
      ? {visibility: 'visible', opacity: 1}
      : {visibility: 'hidden', opacity: 0};

    const {left, right} = isInterleaved
      ? {left: MAP_PADDING}
      : {right: MAP_PADDING + this.mapWidth(bounds, mapScaleFactor)};

    return {
      visibility,
      transition: 'opacity .2s',
      transitionDelay: '.5s',
      opacity,
      position: 'absolute',
      top: 0,
      left,
      right,
      maxWidth: MAX_LEGEND_WIDTH,
    };
  }

  legendValues() {
    const choropleth = this.choropleth();
    const numberFormat = this.props.numberFormat;

    const dataValues = this.data().map(d => d.value.end);
    const valuesExtent = extent(dataValues);

    return choropleth.range().map(value => {
      const ext = choropleth.invertExtent(value);
      const safeExtent = [
        ext[0] === undefined ? valuesExtent[0] : ext[0],
        ext[1] === undefined ? valuesExtent[1] : ext[1]
      ];
      return {
        label: `${numberFormat(safeExtent[0])} - ${numberFormat(safeExtent[1])}`,
        color: choropleth(safeExtent[0]),
      };
    });
  }

  tooltips() {
    const {
      parameters, stage, userDistrictId
    } = this.props;
    const {hoverDistrictKey} = this.state;

    let keys = [];
    if (hoverDistrictKey) {
      keys = [hoverDistrictKey];
    } else if (parameters.tooltips) {
      keys = parameters.tooltips.split(',');
    }
    if (keys.indexOf('user') > -1 && userDistrictId) {
      keys.push(userDistrictId);
    }

    const data = this.data();
    const x = this.xScale();
    const y = this.yScale();
    const {tooltipPosition} = districtsVisualizationStages[stage];

    return data
      .filter(d => keys.indexOf(d.key) > -1)
      .map(d => {
        switch (tooltipPosition) {
        case 'map': {
          const [[x0, y0], [x1, y1]] = d.geo.bounds();

          return {
            boundingRect: {
              top: y0,
              left: x0,
              width: x1 - x0,
              height: y1 - y0,
            },
            districtId: d.key,
            value: d.value,
          };
        }
        case 'endValueDot': {
          return {
            boundingRect: {
              top: y(d.value.end) - 8,
              left: x(data.indexOf(d)) - 8,
              width: 16,
              height: 16,
            },
            districtId: d.key,
            value: d.value,
            placementPreferences: {
              preferBottom: y(d.value.end) > y(d.value.start),
              preferTop: y(d.value.end) < y(d.value.start),
            },
          };
        }
        default: return undefined;
        }
      });
  }

  render() {
    const {
      width, height, stage, legendTitle, districtName, numberFormat,
      diffFormat,
      xAxisLeft, xAxisRight
    } = this.props;
    const {showDifferenceInTooltip, view} = districtsVisualizationStages[stage];

    return (
      <div ref={this.rootRef} style={{position: 'relative', width, height}}>
        <svg ref={this.svgRef} style={{width, height}} />

        <div style={this.legendStyle()}>
          <ColorLegend title={legendTitle} values={this.legendValues()} />
        </div>

        <div className={css(styles.xAxis)} style={{opacity: view === 'chart' ? 1 : 0}}>
          <div style={{float: 'left'}}>
            <ArrowLeft style={{verticalAlign: 'middle'}} />
            {' '}
            {xAxisLeft}
          </div>
          <div style={{float: 'right'}}>
            {xAxisRight}
            {' '}
            <ArrowRight style={{verticalAlign: 'middle'}} />
          </div>
        </div>

        {this.tooltips().map(({boundingRect, placementPreferences, districtId, value}, index) => (
          <Tooltip key={index} boundingRect={boundingRect} contextRect={{left: 0, width, top: 0}} placementPreferences={placementPreferences}>
            {districtName(districtId)} <br/> {numberFormat(value.end)}
            {showDifferenceInTooltip && ` (${diffFormat(value.end - value.start)})`}
          </Tooltip>
        ))}
      </div>
    );
  }
}

DistrictsVisualization.propTypes = {
  // True if the component is rendered as a normal block, interleaved between
  // the ScrollBlock texts. If true, it means we can make use of the whole
  // width of the container and don't have to leave space for the scrolling
  // text on the left. If false, only one such element exists in the
  // ScrollContainer, and is placed at a fixed position while the user scrolls.
  isInterleaved: PropTypes.bool.isRequired,

  // The width and height of the SVG element.
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,

  // The amount of space that the scrolling text will use (on the left side
  // of the container)
  reservedTextWidth: PropTypes.number.isRequired,

  // Needed to determine the correct color scheme.
  dimensionId: PropTypes.string.isRequired,

  legendTitle: PropTypes.string.isRequired,
  xAxisLeft: PropTypes.string.isRequired,
  xAxisRight: PropTypes.string.isRequired,

  // List of districts / data points to render.
  districtData: PropTypes.array.isRequired,
  startYear: PropTypes.string.isRequired,
  endYear: PropTypes.string.isRequired,
  geoJson: PropTypes.object.isRequired,
  districtName: PropTypes.func.isRequired,
  numberFormat: PropTypes.func.isRequired,
  diffFormat: PropTypes.func.isRequired,

  // The stage to show and any additional parameters which are included in the
  // definition of the ScrollBlock.
  stage: PropTypes.oneOf(Object.keys(districtsVisualizationStages)).isRequired,
  parameters: PropTypes.object.isRequired,

  // The user's location (selected gloablly) mapped to a local district id
  userDistrictId: PropTypes.string,
};
