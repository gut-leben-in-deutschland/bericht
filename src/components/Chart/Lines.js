import PropTypes from 'prop-types';
import React from 'react';
import {scaleOrdinal, scalePoint, scaleTime} from 'd3-scale';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {OrderedSet} from 'immutable';
import {range} from 'd3-array';
import {StyleSheet, css} from 'aphrodite';
import {sansBold14, sansBold22, sansRegular12} from 'theme/typeface';
import {softBeige, softGrey, lightGrey, midGrey, darkGrey, transparentAxisStroke} from 'theme/constants';
import {line as lineShape, area as areaShape} from 'd3-shape';
import {timeYear} from 'd3-time';
import layout, {
  LABEL_FONT, VALUE_FONT,
  Y_CONNECTOR, Y_CONNECTOR_PADDING
} from './Lines.layout';
import {timeFormat} from 'd3-time-format';
import subsup from 'utils/subsup';
import ColorLegend from './ColorLegend';

const styles = StyleSheet.create({
  columnTitle: {
    ...sansBold14,
    fill: midGrey
  },
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
  annotationText: {
    fill: darkGrey,
    ...sansRegular12
  },
  value: {
    ...VALUE_FONT,
    fill: midGrey
  },
  valueMini: {
    ...sansBold22
  },
  label: {
    ...LABEL_FONT,
    fill: midGrey
  },
  confidenceLegend: {
    ...sansRegular12,
    color: darkGrey,
    whiteSpace: 'nowrap'
  },
  confidenceBar: {
    display: 'inline-block',
    width: 24,
    height: 11,
    marginBottom: -1,
    backgroundColor: darkGrey,
    borderTop: `4px solid ${softGrey}`,
    borderBottom: `4px solid ${softGrey}`
  }
});

const X_TICK_HEIGHT = 3;
const Y_LABEL_HEIGHT = 12;

const last = (array, index) => array.length - 1 === index;

const calculateLabelY = (linesWithLayout, propery) => {
  let lastY = -Infinity;
  linesWithLayout.filter(line => line[`${propery}Value`]).sortBy(line => line[`${propery}Y`]).forEach(line => {
    let labelY = line[`${propery}Y`];
    let nextY = lastY + Y_LABEL_HEIGHT;
    if (nextY > labelY) {
      labelY = nextY;
    }
    line[`${propery}LabelY`] = lastY = labelY;
  });
};

const LineGroup = (props) => {
  const {
    lines, mini, title,
    y, yTicks, yAxisFormat,
    x, xTicks, xAccessor, xFormat,
    width, yCut, yCutHeight,
    yAnnotations,
    confidence,
    endDy
  } = props;

  const [height] = y.range();
  const xAxisY = height + (yCut ? yCutHeight : 0);

  const pathGenerator = lineShape()
    .x(d => x(xAccessor(d)))
    .y(d => y(d.value));

  const confidenceArea = areaShape()
    .x(d => x(xAccessor(d)))
    .y0(d => y(d.datum[`confidence${confidence}_lower`]))
    .y1(d => y(d.datum[`confidence${confidence}_upper`]));

  const linesWithLayout = lines.map(line => {
    return {
      ...line,
      startX: x(xAccessor(line.start)),
      // we always render at end label outside of the chart area
      // even if the line end in the middle of the graph
      endX: width,
      startY: y(line.start.value),
      endY: y(line.end.value),
    };
  });

  calculateLabelY(linesWithLayout, 'start');
  calculateLabelY(linesWithLayout, 'end');

  return (
    <g>
      <text dy='1.7em' className={css(styles.columnTitle)}>{subsup.svg(title)}</text>
      {
        !!yCut && <text y={height + (yCutHeight / 2)} dy='0.3em' className={css(styles.axisLabel)}>{yCut}</text>
      }
      {
        xTicks.map((tick, i) => {
          let textAnchor = 'middle';
          if (last(xTicks, i)) {
            textAnchor = 'end';
          }
          if (i === 0) {
            textAnchor = 'start';
          }
          return (
            <g key={tick} transform={`translate(${x(tick)},${xAxisY})`}>
              <line className={css(styles.axisXLine)} y2={X_TICK_HEIGHT} />
              <text className={css(styles.axisLabel)} y={X_TICK_HEIGHT + 5} dy='0.6em' textAnchor={textAnchor}>
                {xFormat(tick)}
              </text>
            </g>
          );
        })
      }
      {
        linesWithLayout.map(({line, startValue, endValue, endLabel, highlighted, stroked, start, startX, startY, startLabelY, end, endX, endY, endLabelY, lineColor}, i) => {
          return (
            <g key={i}>
              {startValue && (startValue !== endValue) && (
                <g>
                  <line
                    x1={startX - Y_CONNECTOR_PADDING}
                    x2={startX - Y_CONNECTOR - Y_CONNECTOR_PADDING}
                    y1={startLabelY}
                    y2={startLabelY}
                    stroke={lineColor}
                    strokeWidth={3} />
                  <text
                    className={css(styles.value)}
                    dy='0.3em'
                    x={startX - Y_CONNECTOR - Y_CONNECTOR_PADDING * 2}
                    y={startLabelY}
                    textAnchor='end'>{startValue}</text>
                </g>
              )}
              {confidence && <path
                fill={lineColor}
                fillOpacity='0.2'
                d={confidenceArea(line.toArray())} />}
              <path
                fill='none'
                stroke={lineColor}
                strokeWidth={highlighted ? 6 : 3}
                strokeDasharray={stroked ? '6 2' : 'none'}
                d={pathGenerator(line.toArray())} />
              {endValue && (
                <g>
                  {!mini && <line
                    x1={endX + Y_CONNECTOR_PADDING}
                    x2={endX + Y_CONNECTOR + Y_CONNECTOR_PADDING}
                    y1={endLabelY}
                    y2={endLabelY}
                    stroke={lineColor}
                    strokeWidth={3} />}
                  <text
                    dy={endDy}
                    x={mini ? endX : endX + Y_CONNECTOR + Y_CONNECTOR_PADDING * 2}
                    y={mini ? endLabelY - Y_LABEL_HEIGHT : endLabelY}
                    fill={mini ? darkGrey : midGrey}
                    textAnchor={mini ? 'end' : 'start'}>
                    <tspan className={css(styles[mini ? 'valueMini' : 'value'])}>{endValue}</tspan>
                    {endLabel && <tspan className={css(styles.label)}>{subsup.svg(endLabel)}</tspan>}
                  </text>
                </g>
              )}
            </g>
          );
        })
      }
      {
        yTicks.map((tick, i) => (
          <g key={tick} transform={`translate(0,${y(tick)})`}>
            <line className={css(styles.axisYLine)} x2={width} style={{stroke: tick === 0 ? lightGrey : undefined}} />
            <text className={css(styles.axisLabel)} dy='-3px'>
              {yAxisFormat(tick, last(yTicks, i))}
            </text>
          </g>
        ))
      }
      {
        yAnnotations.map((annotation, i) => (
          <g key={`annotation-${i}`} transform={`translate(0,${y(annotation.value)})`}>
            <line x1={0} x2={width} className={css(styles.annotationLine)} />
            <circle r='3.5' cx={annotation.x ? x(annotation.x) : 4} className={css(styles.annotationCircle)} />
            <text x={width} textAnchor='end' dy={annotation.dy || '-0.4em'} className={css(styles.annotationText)}>{annotation.label} {annotation.formattedValue}</text>
          </g>
        ))
      }
    </g>
  );
};

LineGroup.propTypes = {
  lines: ImmutablePropTypes.listOf(
    PropTypes.shape({
      line: ImmutablePropTypes.listOf(PropTypes.shape({value: PropTypes.number.isRequired})),
      start: PropTypes.shape({value: PropTypes.number.isRequired}),
      end: PropTypes.shape({value: PropTypes.number.isRequired}),
      highlighted: PropTypes.bool,
      stroked: PropTypes.bool,
      lineColor: PropTypes.string.isRequired,
      startValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
      endValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired
    })
  ),
  mini: PropTypes.bool,
  title: PropTypes.string,
  y: PropTypes.func.isRequired,
  yCut: PropTypes.string,
  yCutHeight: PropTypes.number.isRequired,
  yTicks: PropTypes.array.isRequired,
  yAxisFormat: PropTypes.func.isRequired,
  yAnnotations: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired
  })),
  x: PropTypes.func.isRequired,
  xTicks: PropTypes.array.isRequired,
  xAccessor: PropTypes.func.isRequired,
  xFormat: PropTypes.func.isRequired,
  endDy: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  confidence: PropTypes.oneOf([95])
};

const LineChart = (props) => {
  const {
    width, mini,
    children,
    t, description,
    confidence,
    endDy
  } = props;

  const {
    data,
    groupedData,
    xParser,
    xAccessor,
    y,
    yAxis,
    yCut,
    yCutHeight,
    yAnnotations,
    colorLegend,
    colorLegendValues,
    paddingLeft,
    paddingRight,
    columnHeight
  } = layout(props);

  const possibleColumns = Math.floor(width / (props.minInnerWidth + paddingLeft + paddingRight));
  const columns = possibleColumns >= props.columns ? props.columns : Math.max(possibleColumns, 1);

  const columnWidth = Math.floor(width / columns) - 1;
  const innerWidth = columnWidth - paddingLeft - paddingRight;

  const xValues = data.map(xAccessor);
  let x;
  let xTicks;
  let xFormat = d => d;
  if (props.xScale === 'time') {
    xFormat = timeFormat(props.timeFormat);
    const xTimes = xValues.map(d => d.getTime());
    const domainTime = [xTimes.min(), xTimes.max()];
    const domain = domainTime.map(d => new Date(d));
    let yearInteval = Math.round(timeYear.count(domain[0], domain[1]) / 3);

    let time1 = timeYear.offset(domain[0], yearInteval).getTime();
    let time2 = timeYear.offset(domain[1], -yearInteval).getTime();

    x = scaleTime().domain(domain);
    xTicks = OrderedSet([
      domainTime[0],
      xTimes.sortBy(d => Math.abs(d - time1)).first(),
      xTimes.sortBy(d => Math.abs(d - time2)).first(),
      domainTime[1]
    ]).toArray().map(d => new Date(d));
  } else {
    let domain = xValues.toOrderedSet().toArray();
    x = scalePoint().domain(domain);
    xTicks = domain;
    if (domain.length > 5) {
      let maxIndex = domain.length - 1;
      xTicks = OrderedSet([
        domain[0],
        domain[Math.round(maxIndex * 0.33)],
        domain[Math.round(maxIndex * 0.66)],
        domain[maxIndex]
      ]).toArray();
    } else {
      xTicks = domain;
    }
  }
  if (mini) {
    xTicks = [xTicks[0], xTicks[xTicks.length - 1]];
  }
  if (props.xTicks) {
    xTicks = props.xTicks.map(xParser);
  }
  x.range([0, innerWidth]);

  let groups = groupedData.keySeq();
  if (props.columnSort !== 'none') {
    groups = groups.sort();
  }
  groups = groups.toArray();

  const gx = scaleOrdinal().domain(groups).range(range(columns).map(d => d * columnWidth));
  const gy = scaleOrdinal().domain(groups).range(range(groups.length).map(d => Math.floor(d / columns) * columnHeight));
  const rows = Math.ceil(groups.length / columns);

  return (
    <div>
      <svg width={width} height={rows * columnHeight}>
        <desc>{description}</desc>
        {
          groupedData.map((lines, key) => {
            return (
              <g key={key || 1} transform={`translate(${gx(key) + paddingLeft},${gy(key)})`}>
                <LineGroup
                  mini={mini}
                  title={key}
                  lines={lines}
                  x={x}
                  xTicks={xTicks}
                  xAccessor={xAccessor}
                  xFormat={xFormat}
                  y={y}
                  yTicks={yAxis.ticks}
                  yAxisFormat={yAxis.axisFormat}
                  confidence={confidence}
                  yCut={yCut}
                  yCutHeight={yCutHeight}
                  yAnnotations={yAnnotations}
                  endDy={endDy}
                  width={innerWidth} />
              </g>
            );
          }).toArray()
        }
      </svg>
      <div>
        <div style={{paddingLeft, paddingRight}}>
          <ColorLegend inline values={(
            []
              .concat(colorLegend && colorLegendValues)
              .concat(!mini && confidence && {label: (
                <span className={css(styles.confidenceLegend)}>
                  <span className={css(styles.confidenceBar)} />
                  {` ${t(`charts/confidence${confidence}-legend`)}`}
                </span>
              )})
              .filter(Boolean)
          )}/>
        </div>
        {children}
      </div>
    </div>
  );
};

LineChart.propTypes = {
  children: PropTypes.node,
  values: ImmutablePropTypes.list.isRequired,
  width: PropTypes.number.isRequired,
  mini: PropTypes.bool,
  x: PropTypes.string.isRequired,
  xScale: PropTypes.oneOf(['time', 'ordinal']),
  xSort: PropTypes.oneOf(['none']),
  xTicks: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  timeParse: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
  column: PropTypes.string,
  columnSort: PropTypes.oneOf(['none']),
  columnFilter: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    test: PropTypes.string.isRequired
  })),
  highlight: PropTypes.string,
  stroke: PropTypes.string,
  labelFilter: PropTypes.string,
  color: PropTypes.string,
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorSchemes: PropTypes.shape({
    dimension3: PropTypes.array.isRequired,
    category24: PropTypes.array.isRequired
  }).isRequired,
  category: PropTypes.string,
  confidence: PropTypes.oneOf([95]),
  numberFormat: PropTypes.string.isRequired,
  zero: PropTypes.bool.isRequired,
  filter: PropTypes.string,
  startValue: PropTypes.bool.isRequired,
  endLabel: PropTypes.bool.isRequired,
  endDy: PropTypes.string.isRequired,
  minInnerWidth: PropTypes.number.isRequired,
  columns: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  unit: PropTypes.string,
  yAnnotations: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    x: PropTypes.string,
    dy: PropTypes.string
  })),
  t: PropTypes.func.isRequired,
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string
};

export const Line = props => <LineChart {...props} />;

Line.defaultProps = {
  x: 'year',
  xScale: 'time',
  timeParse: '%Y',
  timeFormat: '%Y',
  numberFormat: '.0%',
  zero: true,
  unit: '',
  startValue: false,
  endLabel: true,
  endDy: '0.3em',
  minInnerWidth: 110,
  columns: 1,
  height: 240
};

export const Slope = props => <LineChart {...props} />;

Slope.defaultProps = {
  x: 'year',
  xScale: 'ordinal',
  timeParse: '%Y',
  timeFormat: '%Y',
  numberFormat: '.0%',
  zero: true,
  unit: '',
  startValue: true,
  endLabel: false,
  endDy: '0.3em',
  minInnerWidth: 90,
  columns: 2,
  height: 240
};
