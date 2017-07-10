import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {defaultMemoize as memoize} from 'reselect';
import {shallowEqual} from 'utils/shallowEqual';
import {select, mouse, event} from 'd3-selection';
import 'd3-transition';
import {List, Set} from 'immutable';
import {StyleSheet, css} from 'aphrodite';
import subsup from 'utils/subsup';

import ColorLegend from 'components/Chart/ColorLegend';
import {Tooltip} from 'components/Tooltip/Tooltip';
import {midGrey, userHighlight} from 'theme/constants';
import layout from './layout';
import {sansBold14, sansBold18, sansBold20} from 'theme/typeface';
import {sOnly} from 'theme/mediaQueries';

const styles = StyleSheet.create({
  groupLabel: {
    ...sansBold18,
    fill: midGrey,
    [sOnly]: {
      ...sansBold14
    }
  },
  groupValue: {
    ...sansBold20
  },
  colorLegendPosition: {
    position: 'absolute',
    transition: 'top 400ms'
  },
  interactionLayer: {
    fill: 'transparent',
    userSelect: 'none',
    '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
  }
});

const NBSP = '\u00a0';
const TRANSITION_DURATION = 650;
const TRANSITION_TEXT_FADE_DURATION = 400;
const HIT_TOLERANCE = 10;

// Values for the 'type' column in the data file.
export const GROUP_BACKGROUND = 'Hintergrund';
export const GROUP_INDUSTRY = 'Industrie';
export const GROUP_TRAFFIC = 'Verkehr';

const groupLabelTextKey = ({
  [GROUP_BACKGROUND]: 'flagship/map-dots/background',
  [GROUP_INDUSTRY]: 'flagship/map-dots/industry',
  [GROUP_TRAFFIC]: 'flagship/map-dots/traffic',
});

export const stages = {
  map: {
    position: 'map'
  },
  dots: {
  },
  groups: {
    groupBy: 'type'
  }
};

const parsePoints = points => {
  return List(points)
    .filter(point => point.value !== '-999')
    .map(point => ({
      datum: point,
      value: +point.value,
      coordinates: [+point.lon, +point.lat]
    }))
    .sortBy(a => a.value);
};

export class MapDotsVisualization extends Component {
  constructor(props) {
    super(props);

    this.svgRef = ref => {
      this.svgDom = ref;
    };
    this.state = {};

    this.classNames = Object.keys(styles).reduce(
      (index, key) => {
        index[key] = css(styles[key]);
        return index;
      },
      {}
    );

    const setup = memoize(points => {
      let svg = select(this.svgDom);

      let map = svg.selectAll('g.map').data([1]);
      map = map.merge(map.enter().append('g').classed('map', 1));

      let geotiffImage = map.selectAll('image').data([1]);
      geotiffImage = geotiffImage.merge(geotiffImage.enter().append('image'));

      let circleG = svg.selectAll('g.circleG').data([1]);
      circleG = circleG.merge(circleG.enter().append('g').classed('circleG', 1));
      let circles = circleG.selectAll('circle').data(points.toArray());
      circles = circles.merge(circles.enter().append('circle').attr('shape-rendering', 'geometricPrecision'));

      let mapCircles = map.selectAll('circle').data(points.toArray());
      mapCircles = mapCircles.merge(mapCircles.enter().append('circle'));

      let highlights = svg.selectAll('g.highlights').data([1]);
      highlights = highlights.merge(highlights.enter().append('g').classed('highlights', 1));

      let labels = svg.selectAll('g.labels').data([1]);
      labels = labels.merge(labels.enter().append('g').classed('labels', 1));

      let interactionLayer = svg.selectAll('rect').data([1]);
      interactionLayer = interactionLayer
        .merge(interactionLayer.enter().append('rect'))
        .attr('class', css(styles.interactionLayer));

      const interactionLayerNode = interactionLayer.node();
      const find = () => {
        const [x, y] = mouse(interactionLayerNode);
        points.forEach(p => {
          const xDiff = p.position[0] - x;
          const yDiff = p.position[1] - y;
          p.distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        });
        const hits = points
          .filter(p => {
            const hit = p.distance <= p.r + HIT_TOLERANCE;
            if (hit) {
              return true;
            }
            return false;
          })
          .sortBy(p => p.distance);
        return hits.first();
      };
      const blur = () => {
        if (this.state.hover) {
          this.setState({hover: undefined});
        }
      };
      const focus = () => {
        const hit = find();
        if (hit) {
          event.preventDefault();
          if (this.state.hover !== hit) {
            this.setState({hover: hit.datum.id});
          }
        } else {
          blur();
        }
      };
      interactionLayer
        .on('touchstart', focus)
        .on('touchmove', focus)
        .on('touchend', blur)
        .on('mouseover', focus)
        .on('mousemove', focus)
        .on('mouseout', blur);

      return {
        map,
        mapCircles,
        geotiffImage,
        circles,
        highlights,
        labels,
        interactionLayer
      };
    });
    this.setup = () => setup(this.state.points);
  }
  componentWillMount() {
    const points = parsePoints(this.props.points);
    this.setState({
      points,
      layout: layout(points, this.props)
    });
  }
  componentDidMount() {
    this.renderSvg();
    this.renderHighlights();
  }
  componentWillReceiveProps(nextProps) {
    let points = this.state.points;
    if (nextProps.points !== this.props.points) {
      points = parsePoints(nextProps.points);
    }
    this.setState({
      points,
      layout: layout(points, nextProps)
    });
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }
  componentDidUpdate() {
    if (this.state.layout !== this.renderedLayout) {
      this.renderSvg();
    }
    this.renderHighlights();
  }
  renderHighlights() {
    const {
      highlights,
      mapCircles
    } = this.setup();

    const {
      userAgs,
      colorScale,
      stage
    } = this.props;

    const stageParams = stages[stage];

    const hover = this.state.hover;
    const highlightedIds = Set([hover]);
    const highlightedPoints = this.state.points
      .filter(d => highlightedIds.has(d.datum.id) || d.datum.ags === userAgs)
      .sortBy(d => d.datum.id === hover ? 1 : 0) // ensure hover is rendered on top
      .toArray();
    let highlightCircles = highlights.selectAll('circle').data(highlightedPoints);
    highlightCircles.exit().remove();
    highlightCircles.merge(highlightCircles.enter().append('circle'))
      .attr('fill', d => colorScale(d.value))
      .attr('r', d => d.r)
      .attr('cx', d => d.position[0])
      .attr('cy', d => d.position[1])
      .attr('stroke', d => d.datum.ags === userAgs && d.datum.id !== hover ? userHighlight : 'black')
      .attr('stroke-width', 2);

    mapCircles
      .attr('stroke', d => {
        if (stageParams.position !== 'map') {
          if (d.datum.id === hover) {
            return 'black';
          } else if (d.datum.ags === userAgs) {
            return userHighlight;
          }
        }
        return 'none';
      })
      .attr('stroke-width', 2);
  }
  renderSvg() {
    const {
      geotiffImage,
      circles,
      labels,
      interactionLayer,
      map,
      mapCircles
    } = this.setup();

    const {
      geotiff,
      stage,
      height,
      width,
      threshold,
      colorScale
    } = this.props;

    interactionLayer
      .attr('width', width)
      .attr('height', height);

    const lastStageParams = this.lastStageParams;
    const stageParams = this.lastStageParams = stages[stage];

    const transitionDuration = lastStageParams ? TRANSITION_DURATION : 0;
    const textTransitionDuration = lastStageParams ? TRANSITION_TEXT_FADE_DURATION : 0;

    const {
      mapTransform,
      projection,
      groupLabels
    } = this.state.layout;
    map.transition()
      .duration(transitionDuration)
      .attr('transform', `scale(${mapTransform.scale}) translate(${mapTransform.translate})`);
    mapCircles
      .attr('fill', d => colorScale(d.value))
      .attr('r', 5)
      .transition()
        .duration(transitionDuration)
        .attr('cx', d => d.mapPosition[0])
        .attr('cy', d => d.mapPosition[1]);

    let tl = projection(geotiff.bbox[0]);
    let br = projection(geotiff.bbox[1]);
    geotiffImage
      .attr('xlink:href', geotiff.url)
      .attr('x', tl[0])
      .attr('y', tl[1])
      .attr('width', br[0] - tl[0])
      .attr('height', br[1] - tl[1]);

    circles
      .attr('fill', d => colorScale(d.value))
      .attr('stroke-width', stageParams.position === 'map' ? 1 : 0)
      .attr('stroke', 'white')
      .transition()
        .duration(transitionDuration)
        .delay(d => d.gi * transitionDuration * 0.3)
        .attr('r', d => d.r)
        .attr('cx', d => d.position[0])
        .attr('cy', d => d.position[1]);

    let groupLabelTexts = labels.selectAll('text.label').data(groupLabels);

    groupLabelTexts.exit()
      .transition().duration(textTransitionDuration)
        .style('opacity', 0).remove();
    groupLabelTexts = groupLabelTexts.merge(
      groupLabelTexts.enter().append('text')
        .style('opacity', 0)
        .classed('label', 1)
        .classed(this.classNames.groupLabel, 1)
        .transition()
          .duration(textTransitionDuration)
          .delay(d => d.gi * transitionDuration * 0.3)
          .style('opacity', 1)
    );
    groupLabelTexts
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .text(d => this.props.t(groupLabelTextKey[d.label]));

    let groupValuesTexts = labels.selectAll('text.value').data(groupLabels);
    groupValuesTexts.exit()
      .transition().duration(textTransitionDuration)
        .style('opacity', 0).remove();
    let newGroupValuesTexts = groupValuesTexts.enter().append('text')
      .style('opacity', 0)
      .attr('dy', '1.3em')
      .classed('value', 1)
      .classed(this.classNames.groupValue, 1);
    newGroupValuesTexts.append('tspan');
    newGroupValuesTexts.append('tspan');

    newGroupValuesTexts.transition()
      .duration(textTransitionDuration)
      .delay(d => d.gi * transitionDuration * 0.3)
      .style('opacity', 1);
    groupValuesTexts = groupValuesTexts.merge(newGroupValuesTexts)
      .attr('x', d => d.x)
      .attr('y', d => d.y);

    const colorRange = colorScale.range();
    groupValuesTexts
      .selectAll('tspan')
      .data(d => [[d.overThreshold, colorRange[colorRange.length - 1]], [d.underThreshold, colorScale(threshold - 1)]])
      .attr('fill', d => d[1])
      .text(d => d[0] ? `${d[0]} ${NBSP}` : '');

    this.renderedLayout = this.state.layout;
  }
  renderTooltips() {
    const {width, numberFormat} = this.props;
    const {points} = this.state;
    return [this.state.hover]
      .filter(Boolean)
      .map(id => points.find(d => d.datum.id === id))
      .filter(Boolean)
      .map((d, index) => (
        <Tooltip key={index}
          boundingRect={{
            left: d.position[0] - d.r,
            top: d.position[1] - d.r,
            width: d.r * 2,
            height: d.r * 2
          }}
          contextRect={{left: 0, width, top: 0}}>
          {d.datum.name} <strong>{numberFormat(d.value)}</strong>
        </Tooltip>
      ));
  }
  render() {
    const {width, height, t} = this.props;
    const {colorLegendValues, colorLegendStyle} = this.state.layout;

    return (
      <div ref={this.rootRef} style={{position: 'relative', width, height}}>
        <svg ref={this.svgRef} style={{width, height}} />

        <div className={css(styles.colorLegendPosition)} style={colorLegendStyle}>
          <ColorLegend title={subsup(t('flagship/map-dots/legendTitle'))} values={colorLegendValues} maxWidth={120} />
        </div>
        {this.renderTooltips()}
      </div>
    );
  }
}

MapDotsVisualization.propTypes = {
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
  // of the container). The visualization should not use that space (the top
  // half of the container).
  //
  // Does only need to be honored when isInterleaved === false.
  reservedTextWidth: PropTypes.number.isRequired,
  dimensionId: PropTypes.string.isRequired, // used for color scheme
  points: PropTypes.array.isRequired,
  geoJson: PropTypes.object.isRequired,
  geotiff: PropTypes.shape({
    url: PropTypes.string.isRequired,
    bbox: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired
  }).isRequired,
  numberFormat: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  threshold: PropTypes.number.isRequired,
  colorScale: PropTypes.func.isRequired,

  // The stage to show and any additional parameters which are included in the
  // definition of the ScrollBlock.
  stage: PropTypes.oneOf(Object.keys(stages)).isRequired,

  // The users ags or closest ags with no2 data (selected gloablly)
  userAgs: PropTypes.string,
};
