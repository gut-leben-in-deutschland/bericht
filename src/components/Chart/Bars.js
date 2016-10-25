import React, {PropTypes} from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {scaleLinear, scaleOrdinal} from 'd3-scale';
import vgExpr from 'vega-expression';
import {StyleSheet, css} from 'aphrodite';
import {sansRegular12, sansBold14} from 'theme/typeface';
import {lightGrey, softGrey, midGrey, softBeige, transparentAxisStroke} from 'theme/constants';
import {calculateAxis} from './utils';
import ColorLegend from './ColorLegend';
import {Map} from 'immutable';

const COLUMN_PADDING = 20;
const COLUMN_TITLE_HEIGHT = 30;
const BAR_LABEL_HEIGHT = 15;
const AXIS_BOTTOM_HEIGHT = 30;
const AXIS_BOTTOM_PADDING = 8;
const X_TICK_HEIGHT = 3;

const BAR_STYLES = {
  lollipop: {
    highlighted: {
      marginTop: 4,
      height: 6,
      stroke: 4,
      popHeight: 14,
      marginBottom: 16
    },
    normal: {
      marginTop: 4,
      height: 3,
      stroke: 3,
      popHeight: 13,
      marginBottom: 9
    }
  },
  small: {
    highlighted: {
      marginTop: 0,
      height: 24,
      marginBottom: 16
    },
    normal: {
      marginTop: 0,
      height: 16,
      marginBottom: 9
    }
  },
  large: {
    highlighted: {
      marginTop: 0,
      height: 40,
      marginBottom: 40
    },
    normal: {
      marginTop: 0,
      height: 24,
      marginBottom: 16
    }
  }
};

const datumExpr = vgExpr.compiler(['datum']);
const last = (array, index) => array.length - 1 === index;

const styles = StyleSheet.create({
  groupTitle: {
    ...sansBold14,
    fill: midGrey
  },
  barLabel: {
    ...sansRegular12,
    fill: midGrey
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
  },
  confidenceLegend: {
    whiteSpace: 'nowrap'
  },
  confidenceBar: {
    display: 'inline-block',
    width: 24,
    height: 8,
    // marginBottom: -1,
    backgroundColor: softGrey,
    borderRadius: '4px'
  }
});

const BarChart = (props) => {
  const {
    values,
    width,
    mini,
    children,
    t,
    tLabel,
    description,
    confidence
  } = props;

  const possibleColumns = Math.floor(width / (props.minInnerWidth + COLUMN_PADDING));
  const columns = possibleColumns >= props.columns ? props.columns : Math.max(possibleColumns, 1);
  const columnWidth = Math.floor((width - (COLUMN_PADDING * (columns - 1))) / columns) - 1;

  let data = values;
  if (props.filter) {
    const filter = datumExpr(props.filter);
    data = data.filter(filter.fn);
  }
  data = data.filter(d => d.value.length > 0).map(d => ({
    datum: d,
    label: d[props.y],
    value: +d.value
  }));
  if (props.category) {
    const categorize = datumExpr(props.category).fn;
    data.forEach(d => {
      d.category = categorize(d.datum);
    });
  }
  if (props.sort !== 'none') {
    data = data.sortBy(d => d.value);
    if (props.sort === 'descending') {
      data = data.reverse();
    }
  }

  let groupedData;
  if (props.columnFilter) {
    groupedData = Map(
      props.columnFilter.map(({test, title}) => {
        const filter = datumExpr(test).fn;
        return [title, data.filter(d => filter(d.datum))];
      })
    );
    data = groupedData.toList().flatten();
  } else {
    groupedData = data.groupBy(d => d.datum[props.column]);
  }

  if (props.columnSort !== 'none') {
    groupedData = groupedData.sortBy((d, key) => key);
  }

  const colorAccessor = props.color ? d => d.datum[props.color] : d => d.category;
  let colorValues = data.map(colorAccessor).toOrderedSet().filter(Boolean);
  if (props.colorSort !== 'none') {
    colorValues = colorValues.sort();
  }
  let colorRange = props.colorSchemes[props.colorRange] || props.colorRange;
  if (!colorRange) {
    colorRange = colorValues.size > 3 ? props.colorSchemes.category24 : props.colorSchemes.dimension3;
  }
  const color = scaleOrdinal(colorRange).domain(colorValues.toArray());

  const highlight = props.highlight ? datumExpr(props.highlight).fn : () => false;

  const barStyle = BAR_STYLES[props.barStyle];
  groupedData = groupedData.map((groupData, title) => {
    let gY = 0;
    if (title) {
      gY += COLUMN_TITLE_HEIGHT;
    }

    let firstBarY;
    let stackedBars = groupData.groupBy(d => d.label);
    let marginBottom = 0;
    const bars = stackedBars.map(segments => {
      const first = segments.first();
      const highlighted = highlight(first.datum);
      const style = barStyle[highlighted ? 'highlighted' : 'normal'];

      gY += marginBottom;
      let labelY = gY;
      gY += BAR_LABEL_HEIGHT;
      gY += style.marginTop;
      let y = gY;
      if (firstBarY === undefined) {
        firstBarY = gY;
      }

      gY += style.height;
      marginBottom = style.marginBottom;

      let barSegments = segments;
      if (props.colorSort !== 'none') {
        barSegments = barSegments.sortBy(colorAccessor);
      }

      return {
        labelY,
        y,
        style,
        height: style.height,
        segments: barSegments,
        sum: barSegments.reduce(
          (sum, segment) => sum + segment.value,
          0
        )
      };
    }).toList();

    return {
      title,
      bars,
      max: bars.map(bar => bar.sum).max(),
      height: gY,
      firstBarY
    };
  }).toList();

  const x = scaleLinear()
    .domain(props.domain || [0, groupedData.map(d => d.max).max()])
    .range([0, columnWidth]);
  if (!props.domain) {
    x.nice(3);
  }
  const xAxis = calculateAxis(props.numberFormat, t, x.domain());

  groupedData.forEach(group => {
    group.bars.forEach(bar => {
      let xPos = 0;
      bar.segments.forEach(d => {
        d.color = color(colorAccessor(d));
        d.x = Math.floor(xPos);
        const size = x(d.value);
        d.width = Math.ceil(size) + 1;
        xPos += size;
      });
    });
  });

  // rows and columns
  let yPos = 0;
  groupedData.groupBy((d, i) => Math.floor(i / columns)).forEach(groups => {
    const height = groups.map(d => d.height).max();

    groups.forEach((group, column) => {
      group.groupHeight = height;
      group.y = yPos;
      group.x = column * (columnWidth + COLUMN_PADDING);
    });

    yPos += height + AXIS_BOTTOM_HEIGHT;
  });

  const isLollipop = props.barStyle === 'lollipop';

  return (
    <div>
      <svg width={width} height={yPos}>
        <desc>{description}</desc>
        {
          groupedData.map(group => {
            return (
              <g key={group.title || 1} transform={`translate(${group.x},${group.y})`}>
                <text dy='1.5em' className={css(styles.groupTitle)}>{tLabel(group.title)}</text>
                {
                  group.bars.map(bar => (
                    <g key={bar.y}>
                      <text className={css(styles.barLabel)} y={bar.labelY} dy='0.9em'>{tLabel(bar.segments.first().label)}</text>
                      {
                        bar.segments.map((segment, i) => (
                          <g key={i} transform={`translate(0,${bar.y})`}>
                            <rect x={segment.x} fill={segment.color} width={segment.width} height={bar.height} />
                            {isLollipop && confidence &&
                              <rect
                                rx={bar.style.popHeight / 2} ry={bar.style.popHeight / 2}
                                x={x(segment.datum[`confidence${confidence}_lower`])}
                                y={(bar.height / 2) - (bar.style.popHeight / 2)}
                                width={x(segment.datum[`confidence${confidence}_upper`]) - x(segment.datum[`confidence${confidence}_lower`])}
                                height={bar.style.popHeight}
                                fill={segment.color}
                                fillOpacity='0.3' />
                            }
                            {isLollipop && <circle
                              cx={segment.x + segment.width}
                              cy={bar.height / 2}
                              r={Math.floor(bar.style.popHeight - (bar.style.stroke / 2)) / 2}
                              fill={softBeige}
                              stroke={segment.color}
                              strokeWidth={bar.style.stroke} />}
                          </g>
                        ))
                      }
                    </g>
                  ))
                }
                <g transform={`translate(0,${group.groupHeight + AXIS_BOTTOM_PADDING})`}>
                  <line className={css(styles.axisXLine)} x2={columnWidth} />
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
                          <line className={css(styles.axisXLongLine)} y1={-AXIS_BOTTOM_PADDING - group.groupHeight + group.firstBarY} y2={-AXIS_BOTTOM_PADDING} />
                          <line className={css(styles.axisXLine)} y2={X_TICK_HEIGHT} />
                          <text className={css(styles.axisLabel)} y={X_TICK_HEIGHT + 5} dy='0.6em' textAnchor={textAnchor}>
                            {xAxis.axisFormat(tick, isLast)}
                          </text>
                        </g>
                      );
                    })
                  }
                </g>
              </g>
            );
          })
        }
      </svg>
      <div>
        <ColorLegend inline values={(
          []
            .concat(props.colorLegend && colorValues.size > 0 && colorValues.map(colorValue => (
              {color: color(colorValue), label: tLabel(colorValue)}
            )).toArray())
            .concat(!mini && confidence && {label: (
              <span className={css(styles.confidenceLegend)}>
                <span className={css(styles.confidenceBar)} />
                {` ${t(`charts/confidence${confidence}-legend`)}`}
              </span>
            )})
            .filter(Boolean)
        )}/>
        {children}
      </div>
    </div>
  );
};

BarChart.propTypes = {
  children: PropTypes.node,
  values: ImmutablePropTypes.list.isRequired,
  width: PropTypes.number.isRequired,
  mini: PropTypes.bool,
  domain: PropTypes.array,
  y: PropTypes.string.isRequired,
  barStyle: PropTypes.oneOf(Object.keys(BAR_STYLES)),
  confidence: PropTypes.oneOf([95]),
  sort: PropTypes.oneOf(['none', 'descending']),
  column: PropTypes.string,
  columnSort: PropTypes.oneOf(['none']),
  columnFilter: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    test: PropTypes.string.isRequired
  })),
  highlight: PropTypes.string,
  stroke: PropTypes.string,
  color: PropTypes.string,
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorSort: PropTypes.oneOf(['none']),
  colorLegend: PropTypes.bool,
  colorSchemes: PropTypes.shape({
    dimension3: PropTypes.array.isRequired,
    category24: PropTypes.array.isRequired
  }).isRequired,
  category: PropTypes.string,
  numberFormat: PropTypes.string.isRequired,
  filter: PropTypes.string,
  minInnerWidth: PropTypes.number.isRequired,
  columns: PropTypes.number.isRequired,
  t: PropTypes.func.isRequired,
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string
};

BarChart.defaultProps = {
  columns: 1,
  minInnerWidth: 140,
  barStyle: 'small',
  numberFormat: 's'
};

export const Lollipop = props => <BarChart {...props} />;

Lollipop.defaultProps = {
  barStyle: 'lollipop',
  confidence: 95
};

export default BarChart;
