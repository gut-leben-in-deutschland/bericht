import {Map, List} from 'immutable';
import {getProjection} from 'utils/projection';
import {getGeotiff} from 'utils/geoData';
import {scaleOrdinal, scaleThreshold, scaleQuantize} from 'd3-scale';
import {geoPath} from 'd3-geo';
import {range} from 'd3-array';
import vgExpr from 'vega-expression';
import {defaultMemoize as memoize} from 'reselect';
import {getFormat} from './utils';

const PADDING_TOP = 30; // should be at least marker height from Maps.js
const PADDING_BOTTOM = 10;
const COLUMN_PADDING = 30;

const datumExpr = vgExpr.compiler(['datum']);

export default (props) => {
  const {
    values,
    width,
    mini,
    t,
    tLabel,
    geoData: {geoJson},
    choropleth,
    ignoreMissing
  } = props;

  let data = values;
  if (props.filter) {
    const filter = datumExpr(props.filter);
    data = data.filter(filter.fn);
  }
  const featureIdAccessor = datumExpr(props.featureId).fn;
  data = data.map(d => {
    return {
      datum: d,
      value: +d.value,
      featureId: featureIdAccessor(d)
    };
  });
  const marker = props.shape === 'marker';
  if (marker) {
    data = data.sortBy(d => d.datum.lat).reverse();
  }

  const numberFormat = getFormat(props.numberFormat, t);
  let domain;
  let colorScale;
  let colorAccessor = d => d.value;
  let colorValues;
  let colorRange = props.colorSchemes[props.colorRange] || props.colorRange;

  if (props.ordinalAccessor) {
    colorScale = scaleOrdinal();
    colorAccessor = d => d.datum[props.ordinalAccessor];
    colorValues = data.map(colorAccessor).toOrderedSet();
    domain = colorValues.toArray();
    colorValues = domain.map(value => ({
      label: tLabel(value),
      value
    }));

    if (!colorRange) {
      colorRange = colorValues.size > 3 ? props.colorSchemes.category24 : props.colorSchemes.dimension3;
    }
    colorScale
      .domain(domain)
      .range(colorRange);
  } else {
    const dataValues = data.map(d => d.value);
    const valuesExtent = props.extent || [dataValues.min(), dataValues.max()];

    if (props.thresholds) {
      colorScale = scaleThreshold();
      domain = props.thresholds;
      if (!colorRange) {
        colorRange = props.colorSchemes.sequential.slice(0, domain.length + 1);
      }
    } else {
      colorScale = scaleQuantize();
      domain = valuesExtent;
    }

    colorScale
      .domain(domain)
      .range(colorRange || props.colorSchemes.sequential);

    colorValues = colorScale.range().map(value => {
      const extent = colorScale.invertExtent(value);
      const safeExtent = [
        extent[0] === undefined ? valuesExtent[0] : extent[0],
        extent[1] === undefined ? valuesExtent[1] : extent[1]
      ];
      return {
        value: safeExtent[0],
        label: `${numberFormat(safeExtent[0])} - ${numberFormat(safeExtent[1])}`
      };
    });
  }

  const projection = getProjection();

  const height = props.height;
  const paddingTop = mini ? 15 : PADDING_TOP;
  const paddingBottom = mini ? 0 : PADDING_BOTTOM;
  const innerHeight = mini ? (height - paddingTop - paddingBottom) : height;

  const geoPathGenerator = geoPath().projection(projection);
  let mapWidth;
  if (geoJson) {
    projection.fitSize([width, innerHeight], geoJson);
    const bounds = geoPathGenerator.bounds(geoJson);
    mapWidth = bounds[1][0] - bounds[0][0];
  } else {
    mapWidth = innerHeight * props.widthRatio;
  }

  const columnPadding = mini ? 12 : COLUMN_PADDING;
  const possibleColumns = Math.floor(width / (mapWidth + columnPadding));
  const columns = possibleColumns >= props.columns ? props.columns : Math.max(possibleColumns, 1);

  const padding = (width - mapWidth) / 2;

  const leftAlign = props.leftAlign || columns > 1 || mini;
  if (leftAlign) {
    const projectionTranslate = projection.translate();
    projection.translate([projectionTranslate[0] - padding, projectionTranslate[1]]);
  }

  const colorLegendValues = colorValues
    .map(color => ({
      label: color.label,
      color: colorScale(color.value)
    }));

  let geotiffs = Map();
  const geotiff = getGeotiff(props.geotiff);
  if (geotiff) {
    geotiffs = geotiffs.set(undefined, geotiff);
  }
  let groupedData;
  if (props.columnFilter) {
    groupedData = Map(
      props.columnFilter.map(({test, title, geotiff: columnGeotiff}) => {
        geotiffs = geotiffs.set(title, getGeotiff(columnGeotiff));
        const filter = datumExpr(test).fn;
        return [title, data.filter(d => filter(d.datum))];
      })
    );
    data = groupedData.toList().flatten();
  } else {
    groupedData = data.groupBy(d => d.datum[props.column]);
  }
  // allow empty data for geotiff
  if (groupedData.size === 0 && geotiff) {
    groupedData = Map().set(undefined, List());
  }

  let groups = groupedData.keySeq();
  if (props.columnSort !== 'none') {
    groups = groups.sort();
  }
  groups = groups.toArray();

  const columnHeight = innerHeight + paddingTop + paddingBottom;
  const gx = scaleOrdinal().domain(groups).range(range(columns).map(d => d * (mapWidth + columnPadding)));
  const gy = scaleOrdinal().domain(groups).range(range(groups.length).map(d => Math.floor(d / columns) * columnHeight));
  const rows = Math.ceil(groups.length / columns);

  geotiffs = geotiffs.map(d => {
    let tl = projection(d.bbox[0]);
    let br = projection(d.bbox[1]);
    return {
      xlinkHref: d.url,
      x: tl[0],
      y: tl[1],
      width: br[0] - tl[0],
      height: br[1] - tl[1]
    };
  });

  const paddingLeft = leftAlign ? 0 : padding;
  const mapSpace = (mapWidth + columnPadding) * columns;
  const paddingRight = width - mapSpace - paddingLeft;

  let featuresWithPaths = [];
  if (geoJson) {
    featuresWithPaths = geoJson.features.map(feature => {
      return {
        id: feature.id,
        path: geoPathGenerator(feature),
        bounds: memoize(() => geoPathGenerator.bounds(feature))
      };
    });

    if (choropleth) {
      groupedData = groupedData.map((gD, groupTitle) => {
        let groupData = gD;
        groupData.forEach(d => {
          d.feature = featuresWithPaths.find(f => f.id === d.featureId);
          if (__DEV__ && !ignoreMissing && !d.feature) {
            console.warn(`No feature for data ${data.featureId} ${groupTitle ? ` (${groupTitle})` : ''} ${d.value}`); // eslint-disable-line no-console
          }
        });

        featuresWithPaths.forEach((feature) => {
          const d = groupData.find(datum => datum.featureId === feature.id);
          if (!d) {
            if (__DEV__ && !ignoreMissing) {
              console.warn(`No data for feature ${feature.id} ${groupTitle ? ` (${groupTitle})` : ''}`); // eslint-disable-line no-console
            }
            groupData = groupData.push({
              feature,
              empty: true
            });
          }
        });

        return groupData;
      });
    }
  }

  return {
    paddingTop,
    paddingLeft,
    paddingRight,
    mapSpace,
    mapWidth,
    columnHeight,
    rows,
    gx,
    gy,
    projection,
    colorScale,
    colorAccessor,
    domain,
    data,
    groupedData,
    geotiffs,
    featuresWithPaths,
    colorLegendValues,
    numberFormat
  };
};
