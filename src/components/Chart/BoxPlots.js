import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {scaleLinear} from 'd3-scale';
import vgExpr from 'vega-expression';
import {StyleSheet, css} from 'aphrodite';
import {sansRegular12, sansBold12} from 'theme/typeface';
import {lightGrey, midGrey, softBeige, highlightPrimary, highlightSecondary, transparentAxisStroke} from 'theme/constants';
import {calculateAxis} from './utils';

const datumExpr = vgExpr.compiler(['datum']);
const last = (array, index) => array.length - 1 === index;

const X_TICK_HEIGHT = 3;
const AXIS_BOTTOM_HEIGHT = 24;
const BOX_HEIGHT = 16;
const BOX_MARGIN = 16;

const styles = StyleSheet.create({
  label: {
    fill: midGrey,
    ...sansRegular12
  },
  labelHighlighted: {
    fill: midGrey,
    ...sansBold12
  },
  axisLabel: {
    ...sansRegular12,
    fill: midGrey
  },
  axisXLongLine: {
    stroke: transparentAxisStroke,
    strokeOpacity: 0.6,
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  },
  axisXLine: {
    stroke: lightGrey,
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  }
});

const BoxPlotChart = (props) => {
  const {
    values,
    width,
    children,
    t,
    tLabel,
    description
  } = props;

  const paddingLeft = props.paddingLeft;

  let data = values;
  if (props.filter) {
    const filter = datumExpr(props.filter);
    data = data.filter(filter.fn);
  }

  const highlight = props.highlight ? datumExpr(props.highlight).fn : () => false;
  data = data.map(d => {
    return {
      datum: d,
      median: +d.median,
      q25: +d.q25,
      q75: +d.q75,
      min: +d.min,
      max: +d.max,
      highlighted: highlight(d),
      singleDatum: +d.q25 === +d.median && +d.q75 === +d.median,
      label: d[props.label]
    };
  });
  data = data.sortBy(d => d.median);

  const [
    secondaryColor,
    primaryColor
  ] = props.colorSchemes.category24;

  const x = scaleLinear()
    .domain([
      0,
      data.map(d => d.max).max()
    ])
    .nice(3)
    .range([paddingLeft, width - 1]);

  const xAxis = calculateAxis(props.numberFormat, t, x.domain(), props.unit);

  let yPos = BOX_MARGIN;
  data.forEach(d => {
    d.y = yPos;
    yPos += BOX_HEIGHT;
    yPos += BOX_MARGIN;
  });

  return (
    <div>
      <svg width={width} height={yPos + AXIS_BOTTOM_HEIGHT}>
        <desc>{description}</desc>
        {
          data.map((d, i) => {
            let lineStroke = softBeige;
            if (d.singleDatum) {
              lineStroke = d.highlighted ? highlightPrimary : primaryColor;
            }
            return (
              <g key={i} transform={`translate(0,${d.y})`}>
                <text dy='0.9em' className={d.highlighted ? css(styles.labelHighlighted) : css(styles.label)}>{tLabel(d.label)}</text>
                <line
                  y1={BOX_HEIGHT / 2} y2={BOX_HEIGHT / 2} x1={x(d.min)} x2={x(d.max)}
                  strokeWidth='3px'
                  stroke={d.highlighted ? highlightPrimary : primaryColor}
                  shapeRendering='crispEdges' />
                <rect
                  x={x(d.q25)} width={x(d.q75) - x(d.q25)} height={BOX_HEIGHT}
                  fill={d.highlighted ? highlightSecondary : secondaryColor}
                  shapeRendering='crispEdges' />
                <line x1={x(d.median)} x2={x(d.median)} y2={BOX_HEIGHT} strokeWidth='1px' stroke={lineStroke} shapeRendering='crispEdges' />
              </g>
            );
          })
        }
        <g transform={`translate(0,${yPos})`}>
          <line className={css(styles.axisXLine)} x1={paddingLeft} x2={width} />
          {
            xAxis.ticks.map((tick, i) => {
              let textAnchor = 'middle';
              const isLast = last(xAxis.ticks, i);
              if (isLast) {
                textAnchor = 'end';
              }
              if (i === 0) {
                textAnchor = 'start';
              }
              return (
                <g key={tick} transform={`translate(${x(tick)},0)`}>
                  <line className={css(styles.axisXLongLine)} y1={-BOX_MARGIN} y2={-(yPos - BOX_MARGIN)} />
                  <line className={css(styles.axisXLine)} y2={X_TICK_HEIGHT} />
                  <text className={css(styles.axisLabel)} y={X_TICK_HEIGHT + 5} dy='0.6em' textAnchor={textAnchor}>
                    {xAxis.axisFormat(tick, isLast)}
                  </text>
                </g>
              );
            })
          }
        </g>
      </svg>
      <div>
        {children}
      </div>
    </div>
  );
};

BoxPlotChart.propTypes = {
  children: PropTypes.node,
  values: ImmutablePropTypes.list.isRequired,
  paddingLeft: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  colorSchemes: PropTypes.shape({
    category24: PropTypes.array.isRequired
  }).isRequired,
  unit: PropTypes.string,
  numberFormat: PropTypes.string.isRequired,
  filter: PropTypes.string,
  highlight: PropTypes.string,
  t: PropTypes.func.isRequired,
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string
};

BoxPlotChart.defaultProps = {
  numberFormat: 's',
  paddingLeft: 150,
  unit: ''
};

export default BoxPlotChart;
