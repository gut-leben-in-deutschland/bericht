import React, {Component, PropTypes} from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import geoData, {availableGeotiffs} from 'utils/geoData';
import {scaleOrdinal} from 'd3-scale';
import {symbol, symbolSquare, symbolCircle} from 'd3-shape';
import {StyleSheet, css} from 'aphrodite';
import {sansBold12, sansBold14} from 'theme/typeface';
import {lightGrey, midGrey, darkGrey, beige, black, white} from 'theme/constants';
import {Tooltip} from 'components/Tooltip/Tooltip';
import ColorLegend from './ColorLegend';
import {connect} from 'react-redux';
import LoadingIndicator from 'components/LoadingIndicator/LoadingIndicator';
import {createSelector} from 'reselect';
import layout from './Maps.layout';

const MARKER_HEIGHT = 20;
const MARKER_RADIUS = 5.5;

const styles = StyleSheet.create({
  columnTitle: {
    ...sansBold14,
    fill: midGrey
  },
  legendTitle: {
    ...sansBold12,
    color: darkGrey,
  },
  interactivePath: {
    userSelect: 'none',
    '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
  },
});

const symbolShapes = {
  square: symbolSquare,
  circle: symbolCircle
};
const shapes = Object.keys(symbolShapes).concat('marker');

const Points = ({data, colorScale, colorAccessor, projection, shape, sizes, domain}) => {
  const marker = shape === 'marker';
  let symbolPath;
  if (!marker) {
    const size = scaleOrdinal().domain(domain).range(sizes);
    symbolPath = symbol()
      .type(symbolShapes[shape])
      .size(d => size(colorAccessor(d)));
  }

  return (
    <g>
      {data.map((d, i) => {
        const color = colorScale(colorAccessor(d));
        let pos = projection([d.datum.lon, d.datum.lat]);
        if (marker) {
          pos = pos.map(Math.round);
        }
        return (
          <g key={i} transform={`translate(${pos.join(',')})`}>
            {marker && <circle cy={-MARKER_HEIGHT} r={MARKER_RADIUS} fill={color} stroke={white} strokeWidth='1' />}
            {marker && <line y2={-MARKER_HEIGHT} stroke={color} strokeWidth='2' shapeRendering='crispEdges' />}
            {!marker && (
              <path d={symbolPath(d)} fill={color} />
            )}
          </g>
        );
      })}
    </g>
  );
};

Points.propTypes = {
  data: ImmutablePropTypes.list,
  colorScale: PropTypes.func.isRequired,
  colorAccessor: PropTypes.func.isRequired,
  projection: PropTypes.func.isRequired,
  shape: PropTypes.oneOf(shapes).isRequired,
  domain: PropTypes.array,
  sizes: PropTypes.arrayOf(PropTypes.number)
};

class GenericMap extends Component {
  constructor(props) {
    super(props);
    this.layout = createSelector(
      currentProps => currentProps,
      currentProps => layout(currentProps)
    );
    this.state = {};
  }
  componentDidMount() {
    this.props.loadGeoData();
  }
  renderTooltips() {
    const props = this.props;
    const {
      width,
      tLabel,
      geoData: {name}
    } = props;

    const {
      paddingTop,
      gx,
      gy,
      groupedData,
      numberFormat
    } = this.layout(props);

    const {featureId, title} = this.state;

    return !!featureId && groupedData.map((groupData, groupTitle) => {
      return groupData.filter(datum => datum.featureId === featureId).map((d, i) => {
        const [[x0, y0], [x1, y1]] = d.feature.bounds();
        return (
          <Tooltip key={`${groupTitle}-${i}`}
            boundingRect={{
              top: gy(groupTitle) + paddingTop + y0,
              left: gx(groupTitle) + x0,
              width: x1 - x0,
              height: y1 - y0,
            }}
            contextRect={{left: 0, width, top: 0}}>
            {title === groupTitle ? name(featureId) : null}
            {title === groupTitle && <br/>}
            {tLabel(groupTitle)}
            {!!groupTitle && <br />}
            {numberFormat(d.value)}
          </Tooltip>
        );
      });
    }).toList();
  }
  render() {
    const props = this.props;
    const {
      width,
      children,
      mini,
      tLabel,
      description,
      choropleth,
      ignoreMissing,
      geoData: {geoJson, error: geoError}
    } = props;

    const {
      paddingTop,
      paddingLeft,
      paddingRight,
      mapSpace,
      mapWidth,
      columnHeight,
      rows,
      gx,
      gy,
      data,
      projection,
      colorScale,
      colorAccessor,
      domain,
      groupedData,
      geotiffs,
      featuresWithPaths,
      colorLegendValues
    } = this.layout(props);

    let legendStyle;
    if (paddingRight >= 110 || mini) {
      legendStyle = {
        position: 'absolute',
        top: mini ? 12 : 80,
        left: paddingLeft + mapSpace
      };
    } else {
      legendStyle = {paddingLeft: paddingLeft};
    }

    const {featureId} = this.state;
    const hasTooltips = !!featureId && choropleth;
    const hasGeoJson = !!geoJson;

    return (
      <div style={{position: 'relative'}}>
        <svg width={width} height={columnHeight * rows}>
          <desc>{description}</desc>
            {
              groupedData.map((groupData, title) => {
                const geotiff = geotiffs.get(title) || geotiffs.get(undefined);
                return (
                  <g key={title || 1} transform={`translate(${gx(title)},${gy(title)})`}>
                    <text
                      dy='1.5em' x={paddingLeft + (mapWidth / 2)}
                      textAnchor='middle'
                      className={css(styles.columnTitle)}>
                      {tLabel(title)}
                    </text>
                    <g transform={`translate(0,${paddingTop})`}>
                      {
                        !choropleth && featuresWithPaths.map((feature) => {
                          return (
                            <path key={feature.id}
                              fill={beige}
                              stroke={white}
                              strokeWidth={1}
                              d={feature.path} />
                          );
                        })
                      }
                      {
                        choropleth && hasGeoJson && groupData.map(d => {
                          const {feature} = d;
                          if (!feature) {
                            return null;
                          }
                          let fill;
                          if (d.empty) {
                            fill = ignoreMissing ? lightGrey : 'red';
                          } else {
                            fill = colorScale(colorAccessor(d));
                          }
                          return (
                            <path key={feature.id}
                              fill={fill}
                              d={feature.path}
                              className={css(styles.interactivePath)}
                              onTouchStart={() => this.setState({featureId: feature.id, title})}
                              onTouchEnd={() => this.setState({featureId: undefined, title: undefined})}
                              onMouseEnter={() => this.setState({featureId: feature.id, title})}
                              onMouseLeave={() => this.setState({featureId: undefined, title: undefined})} />
                          );
                        })
                      }
                      {
                        hasTooltips && featuresWithPaths
                          .filter(feature => feature.id === featureId)
                          .map(feature => (
                            <path key={`stroke-${feature.id}`}
                              fill='none'
                              pointerEvents='none'
                              stroke={black}
                              strokeWidth={1}
                              d={feature.path} />
                          ))
                      }
                      {
                        geotiff && (
                          <image {...geotiff} />
                        )
                      }
                      {props.points && (
                        <Points
                          data={data}
                          colorScale={colorScale}
                          colorAccessor={colorAccessor}
                          domain={domain}
                          projection={projection}
                          shape={props.shape}
                          sizes={props.sizes} />
                      )}
                    </g>
                  </g>
                );
              }).toList()
            }
        </svg>
        {(!hasGeoJson || !!geoError) && (
          <div style={{
            position: 'absolute',
            left: paddingLeft,
            top: paddingTop,
            width: mapSpace
          }}>
            {geoError ?
              geoError :
              <LoadingIndicator t={props.t} />
            }
          </div>
        )}
        <div>
          <div style={legendStyle}>
            {!!props.geotiffLegendTitle && (
              <ColorLegend
                title={tLabel(props.geotiffLegendTitle)}
                values={props.geotiffLegend} />
            )}
            <ColorLegend
              title={tLabel(props.legendTitle)}
              shape={props.shape}
              values={colorLegendValues} />
          </div>
          {children}
        </div>
        {hasTooltips && this.renderTooltips()}
      </div>
    );
  }
}

GenericMap.propTypes = {
  children: PropTypes.node,
  values: ImmutablePropTypes.list.isRequired,
  width: PropTypes.number.isRequired,
  // inner map width ratio to size canvas until geo data is loaded
  widthRatio: PropTypes.number.isRequired,
  leftAlign: PropTypes.bool,
  mini: PropTypes.bool,
  height: PropTypes.number.isRequired,
  column: PropTypes.string,
  columnSort: PropTypes.oneOf(['none']),
  columnFilter: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    test: PropTypes.string.isRequired,
    geotiff: PropTypes.oneOf(availableGeotiffs)
  })),
  columns: PropTypes.number.isRequired,
  thresholds: PropTypes.arrayOf(PropTypes.number),
  extent: PropTypes.arrayOf(PropTypes.number),
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorSchemes: PropTypes.shape({
    dimension3: PropTypes.array.isRequired,
    category24: PropTypes.array.isRequired,
    sequential: PropTypes.array.isRequired
  }).isRequired,
  shape: PropTypes.oneOf(shapes).isRequired,
  sizes: PropTypes.arrayOf(PropTypes.number),
  geotiff: PropTypes.oneOf(availableGeotiffs),
  geotiffLegendTitle: PropTypes.string,
  geotiffLegend: PropTypes.arrayOf(PropTypes.shape({
    color: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })),
  legendTitle: PropTypes.string.isRequired,
  unit: PropTypes.string,
  numberFormat: PropTypes.string.isRequired,
  filter: PropTypes.string,
  points: PropTypes.bool.isRequired,
  choropleth: PropTypes.bool.isRequired,
  geoData: PropTypes.shape({
    isLoading: PropTypes.bool.isRequired,
    error: PropTypes.string,
    geoJson: PropTypes.object
  }).isRequired,
  loadGeoData: PropTypes.func.isRequired,
  featureId: PropTypes.string.isRequired,
  ignoreMissing: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string,
  ordinalAccessor: PropTypes.string
};

GenericMap.defaultProps = {
  numberFormat: 's',
  columns: 1,
  height: 290,
  widthRatio: 0.7422, // ratio of germany
  unit: '',
  points: false,
  choropleth: false,
  ignoreMissing: false,
  featureId: 'false',
  shape: 'circle',
  sizes: [10]
};

const GenericMapWithFeatures = connect(
  (state, props) => ({
    geoData: geoData(props.features).selector(state)
  }),
  (dispatch, props) => ({
    loadGeoData: () => geoData(props.features).load(dispatch)
  })
)(GenericMap);

export const PointMap = props => <GenericMapWithFeatures {...props} />;

PointMap.defaultProps = {
  points: true,
  features: 'germany'
};

export const KRegMap = props => <GenericMapWithFeatures {...props} />;

KRegMap.defaultProps = {
  features: 'kreg-2014',
  featureId: '+datum.KREG',
  choropleth: true
};


export const KrsMap = ({krsYear, ...props}) => <GenericMapWithFeatures {...props} features={`krs-${krsYear}`} />;

KrsMap.propTypes = {
  krsYear: PropTypes.oneOf([2014, 2015, 'mpidr-396'])
};

KrsMap.defaultProps = {
  krsYear: 2014,
  featureId: '+datum.krs',
  choropleth: true
};

export const StatesMap = props => <GenericMapWithFeatures {...props} />;

StatesMap.defaultProps = {
  features: 'states',
  featureId: 'datum.state',
  choropleth: true
};
