import {Map, List} from 'immutable';
import {timeParse} from 'd3-time-format';
import vgExpr from 'vega-expression';
import {scaleLinear, scaleOrdinal} from 'd3-scale';
import {calculateAxis} from './utils';
import {createTextGauger} from 'utils/textGauger';
import subsup from 'utils/subsup';

// import {valueFont, labelFont} from './Lines';
import {sansBold12 as VALUE_FONT} from 'theme/typeface';
import {sansRegular12 as LABEL_FONT} from 'theme/typeface';
export {sansBold12 as VALUE_FONT} from 'theme/typeface';
export {sansRegular12 as LABEL_FONT} from 'theme/typeface';

const datumExpr = vgExpr.compiler(['datum']);

const COLUMN_TITLE_HEIGHT = 24;
const AXIS_TOP_HEIGHT = 24;
const AXIS_BOTTOM_HEIGHT = 24;
const AXIS_BOTTOM_CUTOFF_HEIGHT = 40;

export const Y_CONNECTOR = 6;
export const Y_CONNECTOR_PADDING = 4;
const Y_END_LABEL_SPACE = 3; // width of space between label and value

const valueGauger = createTextGauger(VALUE_FONT, {dimension: 'width', html: true});
const labelGauger = createTextGauger(LABEL_FONT, {dimension: 'width', html: true});

export default (props) => {
  const {
    values,
    mini,
    tLabel,
    yAnnotations
  } = props;
  let data = values;
  if (props.filter) {
    const filter = datumExpr(props.filter);
    data = data.filter(filter.fn);
  }
  let xParser = x => x;
  if (props.xScale === 'time') {
    xParser = timeParse(props.timeParse);
  }
  data = data.filter(d => d.value && d.value.length > 0).map(d => ({
    datum: d,
    x: xParser(d[props.x]),
    value: +d.value
  }));
  if (props.category) {
    const categorize = datumExpr(props.category).fn;
    data.forEach(d => {
      d.category = categorize(d.datum);
    });
  }
  const xAccessor = d => d.x;
  if (props.xSort !== 'none') {
    data = data.sortBy(xAccessor);
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
  const lineGroup =  props.category ? d => d.category : d => d.datum[props.color];

  const yCutHeight = mini ? 25 : AXIS_BOTTOM_CUTOFF_HEIGHT;
  const paddingTop = AXIS_TOP_HEIGHT + (props.column ? COLUMN_TITLE_HEIGHT : 0);
  const paddingBottom = AXIS_BOTTOM_HEIGHT + (props.zero ? 0 : yCutHeight);
  const innerHeight = mini ? props.height - paddingTop - paddingBottom : props.height;
  const columnHeight = innerHeight + paddingTop + paddingBottom;

  let yValues = data.map(d => d.value);
  if (yAnnotations) {
    yValues = yValues.concat(yAnnotations.map(d => d.value));
  }
  const y = scaleLinear()
    .domain([
      props.zero ? 0 : yValues.min(),
      yValues.max()
    ])
    .nice(3)
    .range([innerHeight + paddingTop, paddingTop]);
  const colorAccessor = props.color ? d => d.datum[props.color] : d => d.category;
  const colorValues = data.map(colorAccessor).toSet().filter(Boolean).sort();

  let colorRange = props.colorSchemes[props.colorRange] || props.colorRange;
  if (!colorRange) {
    colorRange = colorValues.size > 3 ? props.colorSchemes.category24 : props.colorSchemes.dimension3;
  }
  const color = scaleOrdinal(colorRange).domain(colorValues.toArray());

  const {unit, t} = props;
  let yCut;
  if (!props.zero) {
    yCut = t('charts/y-cut');
  }
  const yAxis = calculateAxis(props.numberFormat, t, y.domain(), tLabel(unit));
  const {format: yFormat} = yAxis;

  const startValue = !mini && props.startValue;
  const endLabel = !mini && props.endLabel && colorValues.size > 0;

  let startValueSizes = List();
  let endValueSizes = List();
  let endLabelSizes = List();

  const highlight = props.highlight ? datumExpr(props.highlight).fn : () => false;
  const stroke = props.stroke ? datumExpr(props.stroke).fn : () => false;
  const labelFilter = props.labelFilter ? datumExpr(props.labelFilter).fn : () => true;
  groupedData = groupedData
    .map(group => group.groupBy(lineGroup).toList())
    .map(lines => {
      const linesWithLabels = lines.map(line => {
        const start = line.first();
        const end = line.last();

        const label = labelFilter(start.datum);

        return {
          line,
          start,
          end,
          highlighted: highlight(start.datum),
          stroked: stroke(start.datum),
          lineColor: color(colorAccessor(start)),
          startValue: label && startValue && yFormat(start.value),
          endValue: label && yFormat(end.value),
          endLabel: label && endLabel && ` ${tLabel(colorAccessor(end))}`
        };
      });

      if (startValue) {
        startValueSizes = startValueSizes.concat(
          linesWithLabels.map(line => line.startValue ? valueGauger(line.startValue) : 0)
        );
      }
      if (!mini) {
        endValueSizes = endValueSizes.concat(
          linesWithLabels.map(line => line.endValue ? valueGauger(line.endValue) : 0)
        );
        if (endLabel) {
          endLabelSizes = endLabelSizes.concat(
            linesWithLabels.map(line => line.endLabel ? labelGauger(line.endLabel) + Y_END_LABEL_SPACE : 0)
          );
        }
      }

      return linesWithLabels;
    });

  let colorLegend = !mini && colorValues.size > 0 && !endLabel;
  let paddingLeft = 0;
  let paddingRight = 0;

  const whiteSpacePadding = groupedData.size > 1 && props.columns > 1 ? 15 : 0;

  if (!mini) {
    const yConnectorSize = Y_CONNECTOR + Y_CONNECTOR_PADDING * 2;
    const startValueSize = startValue ?
      Math.ceil(startValueSizes.max() + yConnectorSize) :
      0;
    const endValueSize = Math.ceil(endValueSizes.max() + yConnectorSize);
    if (startValue) {
      paddingLeft = paddingRight = Math.max(startValueSize, endValueSize) + whiteSpacePadding;
    } else {
      paddingRight = endValueSize + whiteSpacePadding;
    }
    if (endLabel) {
      const endLabelSize = Math.ceil(endLabelSizes.max());
      if (startValueSize + endValueSize + endLabelSize > props.width / 2) {
        colorLegend = true;
        groupedData.forEach(lines => {
          lines.forEach(line => {
            line.endLabel = false;
          });
        });
      } else {
        if (startValue) {
          paddingLeft = startValueSize + whiteSpacePadding;
        }
        paddingRight = endValueSize + endLabelSize + whiteSpacePadding;
      }
    }
  }

  // translate all color values (always display on small screens) and group titles
  const colorLegendValues = colorValues.map(value => ({
    color: color(value),
    label: subsup(tLabel(value))
  })).toArray();
  const translatedGroupedData = Map(groupedData.map((v, key) => [tLabel(key), v]).toArray());
  const translatedYAnnotations = (yAnnotations || []).map(d => ({
    formattedValue: yFormat(d.value),
    ...d,
    label: tLabel(d.label),
    x: d.x ? xParser(d.x) : undefined
  }));

  return {
    data,
    groupedData: translatedGroupedData,
    xParser,
    xAccessor,
    y,
    yAxis,
    yCut,
    yCutHeight,
    yAnnotations: translatedYAnnotations,
    colorLegend,
    colorLegendValues,
    paddingLeft,
    paddingRight,
    columnHeight
  };
};
