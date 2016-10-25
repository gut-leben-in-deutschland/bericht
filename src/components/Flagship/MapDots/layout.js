import {defaultMemoize as memoize} from 'reselect';
import {getProjection} from 'utils/projection';
import {geoPath} from 'd3-geo';
import {stages} from './Visualization';
import {scalePoint} from 'd3-scale';
import {range} from 'd3-array';

const DOT_GROUP_PADDING = 20;
const MAP_PADDING = 10;
const GAP = 50;
const GROUP_LABEL_HEIGHT = 70;
const RESERVED_LEGEND_WIDTH = 100;

const getGeoPaths = memoize((geoJson, x, y, width, height) => {
  const projection = getProjection();
  projection.fitExtent([[x, y], [x + width, y + height]], geoJson);
  const getPath = geoPath().projection(projection);

  return {
    bounds: getPath.bounds(geoJson),
    projection
  };
});

const smallMapHeight = props => props.height * 0.4;

const getMapTransform = (bounds, props) => {
  const {
    stage,
    reservedTextWidth,
    width
  } = props;
  if (stage === 'map') {
    return {
      scale: 1,
      translate: [0, 0]
    };
  }

  const actualMapWidth = bounds[1][0] - bounds[0][0];
  const actualMapHeight = bounds[1][1] - bounds[0][1];

  // Scale the map down to fit into the top right corner of the SVG,
  // into a block which is at most 'smallMapHeight' tall and leaves enough
  // horizontal space for the legend and scrolling text.
  const extraHorizontalSpace = reservedTextWidth;
  const scaleX = (width - extraHorizontalSpace - MAP_PADDING - RESERVED_LEGEND_WIDTH) / actualMapWidth;
  const scaleY = smallMapHeight(props) / actualMapHeight;

  const scale = Math.min(scaleX, scaleY);

  const translateX = width / scale - bounds[1][0] - MAP_PADDING;
  const translateY = -bounds[0][1];

  return {
    scale,
    translate: [translateX, translateY]
  };
};

const getSideArea = props => {
  const {
    width,
    height,
    reservedTextWidth
  } = props;

  const areaHeight = Math.floor(height * 0.8);
  const leftPadding = reservedTextWidth;
  const areaWidth = width - leftPadding - 2 * MAP_PADDING;
  const x = leftPadding + MAP_PADDING;
  const y = (height - areaHeight) / 2;

  const mapX = x + RESERVED_LEGEND_WIDTH;
  const mapWidth = areaWidth - RESERVED_LEGEND_WIDTH;

  return {
    x,
    y,
    width: areaWidth,
    height: areaHeight,
    mapX,
    mapWidth
  };
};

export default (points, props) => {
  const {
    stage, geoJson, height, numberFormat,
    threshold,
    colorScale, t
  } = props;
  const stageParams = stages[stage];

  const sideArea = getSideArea(props);
  const {
    projection,
    bounds
  } = getGeoPaths(geoJson, sideArea.mapX, sideArea.y, sideArea.mapWidth, sideArea.height);

  const mapTransform = getMapTransform(bounds, props);

  let groupLabels = [];
  points.forEach(d => {
    d.mapPosition = projection(d.coordinates);
  });
  if (stageParams.position === 'map') {
    points.forEach(d => {
      d.r = 4;
      d.gi = 0;
      d.position = d.mapPosition;
    });
  } else {
    const groupedPoints = points.groupBy(d => d.datum[stageParams.groupBy]);
    const maxPoints = groupedPoints.map(group => group.size).max();

    const mapHeight = smallMapHeight(props);
    const y = height - 20;
    const dotsHeight = height -
      mapHeight - (props.isInterleaved ? GAP : 0) - DOT_GROUP_PADDING - GROUP_LABEL_HEIGHT;
    let dotsWidth = sideArea.width;
    dotsWidth -= DOT_GROUP_PADDING * (groupedPoints.size - 1);
    dotsWidth /= groupedPoints.size;

    const areaPerDot = (dotsHeight * dotsWidth) / maxPoints;
    const circleSize = Math.floor(Math.sqrt(areaPerDot) - 1);
    let radius = (circleSize / 2) - 2;

    const columns = Math.floor(dotsWidth / circleSize);
    const pxRange = [sideArea.x + dotsWidth - radius, sideArea.x + radius];
    const px = scalePoint()
      .domain(range(columns))
      .range(pxRange);
    const rows = Math.ceil(maxPoints / columns);
    const pyRange = [y - radius, y - circleSize * rows + radius];
    const py = scalePoint()
      .domain(range(rows))
      .range(pyRange);

    groupedPoints.toList().forEach((group, groupI) => {
      const gx = (dotsWidth + DOT_GROUP_PADDING) * groupI;
      if (stageParams.groupBy) {
        const overThreshold = group.filter(p => p.value >= threshold).size;
        groupLabels.push({
          label: group.first().datum[stageParams.groupBy],
          x: pxRange[1] + gx - radius,
          y: pyRange[1] - radius - GROUP_LABEL_HEIGHT,
          gi: groupI,
          size: group.size,
          overThreshold,
          underThreshold: group.size - overThreshold
        });
      }

      group.forEach((point, i) => {
        point.r = radius;
        point.gi = groupI;
        point.position = [gx + px(i % columns), py(Math.floor(i / columns))];
      });
    });
  }

  const extent = [0, points.map(d => d.value).max()];

  let colorLegendValues = colorScale.range().map(value => {
    const rangeExtent = colorScale.invertExtent(value);
    const safeExtent = [
      rangeExtent[0] === undefined ? extent[0] : rangeExtent[0],
      rangeExtent[1] === undefined ? extent[1] : rangeExtent[1]
    ];
    return {
      value: safeExtent[0],
      color: colorScale(safeExtent[0]),
      label: `${numberFormat(safeExtent[0])} - ${numberFormat(safeExtent[1])}`
    };
  });
  const thresholdLegendIndex = colorLegendValues.findIndex(d => d.value >= threshold);
  colorLegendValues = [
    ...colorLegendValues.slice(0, thresholdLegendIndex),
    {label: t('flagship/map-dots/threshold')},
    ...colorLegendValues.slice(thresholdLegendIndex)
  ];

  return {
    mapTransform,
    projection,
    colorLegendValues,
    colorLegendStyle: {
      top: stage === 'map' ? 20 : 0,
      left: sideArea.x
    },
    groupLabels
  };
};
