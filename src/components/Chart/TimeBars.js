import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {scaleLinear, scaleOrdinal, scaleBand} from 'd3-scale';
import vgExpr from 'vega-expression';
import {StyleSheet, css} from 'aphrodite';
import {sansRegular12, sansBold12} from 'theme/typeface';
import {softBeige, softGrey, lightGrey, midGrey, darkGrey, transparentAxisStroke} from 'theme/constants';
import {calculateAxis} from './utils';
import {OrderedSet, Set} from 'immutable';
import ColorLegend from './ColorLegend';

const datumExpr = vgExpr.compiler(['datum']);
const last = (array, index) => array.length - 1 === index;

const X_TICK_HEIGHT = 3;
const AXIS_BOTTOM_HEIGHT = 24;

const styles = StyleSheet.create({
  axisLabel: {
    ...sansRegular12,
    fill: midGrey
  },
  axisYLine: {
    stroke: transparentAxisStroke,
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  },
  axisXLine: {
    stroke: lightGrey,
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  },
  annotationCircle: {
    stroke: darkGrey,
    fill: softBeige
  },
  annotationLine: {
    stroke: darkGrey,
    strokeWidth: '1px',
    fillRule: 'evenodd',
    strokeLinecap: 'round',
    strokeDasharray: '1,3',
    strokeLinejoin: 'round'
  },
  annotationLineValue: {
    stroke: darkGrey,
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  },
  annotationValue: {
    fill: darkGrey,
    ...sansBold12
  },
  annotationText: {
    fill: darkGrey,
    ...sansRegular12
  },
});

const TimeBarChart = (props) => {
  const {
    values,
    width,
    mini,
    children,
    t,
    tLabel,
    description,
    yAnnotations,
    xAnnotations
  } = props;

  const paddingTop = 24;

  let data = values;
  if (props.filter) {
    const filter = datumExpr(props.filter);
    data = data.filter(filter.fn);
  }
  data = data.filter(d => d.value && d.value.length > 0).map(d => {
    return {
      datum: d,
      year: +d.year,
      value: +d.value
    };
  });
  data = data.sortBy(d => d.value).reverse();

  const colorAccessor = d => d.datum[props.color];
  const colorValues = data.map(colorAccessor).toOrderedSet().filter(Boolean);
  let colorRange = props.colorSchemes[props.colorRange] || props.colorRange;
  if (!colorRange) {
    colorRange = colorValues.size > 3 ? props.colorSchemes.category24 : props.colorSchemes.dimension3;
  }
  const color = scaleOrdinal(colorRange).domain(colorValues.toArray());

  const bars = data.groupBy(d => d.year).map((group, year) => {
    const segments = group;

    return {
      segments,
      sum: segments.reduce(
        (sum, segment) => sum + segment.value,
        0
      ),
      year
    };
  }).toList();

  const innerHeight = props.height - (mini ? paddingTop + AXIS_BOTTOM_HEIGHT : 0);
  const y = scaleLinear()
    .domain(props.domain ? props.domain : [
      0,
      bars.map(d => d.sum).max()
    ])
    .range([innerHeight, 0]);

  if (!props.domain) {
    y.nice(3);
  }

  bars.forEach(group => {
    let stackValue = 0;
    let yPos = y.range()[0];
    group.segments.forEach(segment => {
      let y0 = y(stackValue);
      let y1 = y(stackValue + segment.value);
      const size = y0 - y1;
      yPos -= size;
      segment.y = yPos;
      segment.height = size;
      stackValue += segment.value;
    });
  });

  const yAxis = calculateAxis(props.numberFormat, t, y.domain(), tLabel(props.unit));

  let xYears = data.map(d => d.year).toOrderedSet();
  // add years from annotations
  xYears = xYears.concat(Set(xAnnotations.map(d => Set([d.x, d.x1, d.x2]))).flatten().filter(Boolean).map(d => +d));

  xYears = xYears.sort();

  const xPadding = props.padding;
  const x = scaleBand()
    .domain(xYears.toArray())
    .range([xPadding, width - xPadding])
    .padding(0.25)
    .round(true);

  const gapsNeeded = Math.ceil(Math.max(26 / x.bandwidth(), 2));

  const xDomain = xYears.reduce(
    (years, year) => {
      years.push(year);
      if (!xYears.has(year + 1) && year !== xYears.last()) {
        for (let i = 0; i < gapsNeeded; i++) {
          years.push(`G${i} ${year}`);
        }
      }
      return years;
    },
    []
  );

  x.domain(xDomain).round(true);

  const barWidth = x.bandwidth();
  const barStep = x.step();
  const barPadding = barStep - barWidth;

  let xTicks;
  if (barStep >= 50) {
    xTicks = xYears.toArray();
  } else {
    xTicks = OrderedSet(
      xYears.filter(year => !xYears.has(year + 1) || !xYears.has(year - 1)) // edge years
    ).toArray();
  }

  const xDomainLast = xDomain[xDomain.length - 1];
  const baseLines = xDomain.reduce(
    (lines, year) => {
      let previousLine = lines[lines.length - 1];
      let x1 = previousLine ? previousLine.x2 : 0;
      let x2 = year === xDomainLast ? width : x(year) + barStep;
      const gap = year[0] === 'G';
      if (gap) {
        x2 -= barPadding;
      }

      if (previousLine && previousLine.gap === gap) {
        previousLine.x2 = x2;
      } else {
        lines.push({
          x1,
          x2,
          gap
        });
      }
      return lines;
    },
    []
  );

  return (
    <div>
      <svg width={width} height={innerHeight + paddingTop + AXIS_BOTTOM_HEIGHT}>
        <desc>{description}</desc>
        <g transform={`translate(0,${paddingTop})`}>
          <g transform={`translate(0,${innerHeight + 1})`}>
            {
              baseLines.map((line, i) => {
                return <line key={i} x1={line.x1} x2={line.x2} className={css(styles.axisXLine)} strokeDasharray={line.gap ? '2 2' : 'none'} />;
              })
            }
            {
              xTicks.map(tick => {
                return (
                  <g key={tick} transform={`translate(${x(tick) + Math.round(barWidth / 2)},0)`}>
                    <line className={css(styles.axisXLine)} y2={X_TICK_HEIGHT} />
                    <text className={css(styles.axisLabel)} y={X_TICK_HEIGHT + 5} dy='0.6em' textAnchor='middle'>
                      {tick}
                    </text>
                  </g>
                );
              })
            }
          </g>
          {
            xAnnotations.filter(annotation => annotation.ghost).map((annotation, i) => (
              <rect key={`ghost-${i}`}
                x={x(+annotation.x)}
                y={y(annotation.value)}
                width={barWidth}
                height={y(0) - y(annotation.value)}
                shapeRendering='crispEdges'
                fill={softGrey} />
            ))
          }
          {
            bars.map(bar => {
              return (
                <g key={bar.year} transform={`translate(${x(bar.year)},0)`}>
                  {
                    bar.segments.map((segment, i) => (
                      <rect key={i}
                        y={segment.y}
                        width={barWidth}
                        height={segment.height}
                        shapeRendering='crispEdges'
                        fill={color(colorAccessor(segment))} />
                    ))
                  }
                </g>
              );
            })
          }
          {
            yAxis.ticks.map((tick, i) => (
              <g key={tick} transform={`translate(0,${y(tick)})`}>
                {tick > 0 && <line className={css(styles.axisYLine)} x2={width}/>}
                <text className={css(styles.axisLabel)} dy='-3px'>
                  {yAxis.axisFormat(tick, last(yAxis.ticks, i))}
                </text>
              </g>
            ))
          }
          {
            yAnnotations.map((annotation, i) => (
              <g key={`y-annotation-${i}`} transform={`translate(0,${y(annotation.value)})`}>
                <line x1={0} x2={width} className={css(styles.annotationLine)} />
                <circle r='3.5' cx={annotation.x ? x(+annotation.x) : 4} className={css(styles.annotationCircle)} />
                <text x={width} textAnchor='end' dy={annotation.dy || '-0.4em'} className={css(styles.annotationText)}>{tLabel(annotation.label)} {yAxis.format(annotation.value)}</text>
              </g>
            ))
          }
          {
            xAnnotations.map((annotation, i) => {
              const range = annotation.x1 !== undefined && annotation.x2 !== undefined;
              const x1 = range ? x(+annotation.x1) : x(+annotation.x);
              const x2 = range ? x(+annotation.x2) + barWidth : x1 + Math.max(barWidth, 8);
              const compact = width < 500;
              let tx = x1;
              if (compact) {
                tx -= range ? 0 : barWidth * 2;
              } else {
                tx += (x2 - x1) / 2;
              }
              const textAnchor = compact ? 'start' : 'middle';
              return (
                <g key={`x-annotation-${i}`} transform={`translate(0,${y(annotation.value)})`}>
                  <line x1={x1} x2={x2} className={css(range ? styles.annotationLine : styles.annotationLineValue)} />
                  <circle r='3.5' cx={x1} className={css(styles.annotationCircle)} />
                  {range && <circle r='3.5' cx={x2} className={css(styles.annotationCircle)} />}
                  <text x={tx} textAnchor={textAnchor} dy='-1.8em' className={css(styles.annotationText)}>
                    {tLabel(annotation.label)}
                  </text>
                  <text x={tx} textAnchor={textAnchor} dy='-0.5em' className={css(styles.annotationValue)}>
                    {tLabel(annotation.valuePrefix)}{yAxis.format(annotation.value)}
                  </text>
                </g>
              );
            })
          }
        </g>
      </svg>
      <div>
        {!mini && <ColorLegend inline values={(
          []
            .concat(props.colorLegend && colorValues.size > 0 && colorValues.map(colorValue => (
              {color: color(colorValue), label: tLabel(colorValue)}
            )).toArray())
            .filter(Boolean)
        )}/>}
        {children}
      </div>
    </div>
  );
};

TimeBarChart.propTypes = {
  children: PropTypes.node,
  values: ImmutablePropTypes.list.isRequired,
  padding: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  mini: PropTypes.bool,
  height: PropTypes.number.isRequired,
  sort: PropTypes.oneOf(['none', 'descending']),
  color: PropTypes.string,
  colorRange: PropTypes.array,
  colorLegend: PropTypes.bool,
  colorSchemes: PropTypes.shape({
    dimension3: PropTypes.array.isRequired,
    category24: PropTypes.array.isRequired
  }).isRequired,
  domain: PropTypes.arrayOf(PropTypes.number),
  yAnnotations: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    x: PropTypes.string,
    dy: PropTypes.string
  })).isRequired,
  xAnnotations: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    label: PropTypes.string,
    x: PropTypes.string
  })).isRequired,
  unit: PropTypes.string,
  numberFormat: PropTypes.string.isRequired,
  filter: PropTypes.string,
  t: PropTypes.func.isRequired,
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string
};

TimeBarChart.defaultProps = {
  numberFormat: 's',
  height: 240,
  padding: 50,
  unit: '',
  colorLegend: true,
  yAnnotations: [],
  xAnnotations: []
};

export default TimeBarChart;
