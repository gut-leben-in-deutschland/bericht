import React, {PropTypes, Component} from 'react';
import {withCabinet} from 'cabinet';
import {connect} from 'react-redux';

import {MapDotsVisualization} from './Visualization';
import No2Stats from './No2Stats';
import {getFormat} from 'components/Chart/utils';
import {ScrollContainer} from 'components/Flagship/ScrollContainer';
import LocationSelect from 'components/Flagship/LocationSelect';
import {scaleThreshold} from 'd3-scale';

import geoData, {getGeotiff} from 'utils/geoData';
import {shallowEqual} from 'utils/shallowEqual';

class MapDotsScrollContainer extends Component {
  componentDidMount() {
    this.props.loadGeoData();
  }
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }
  render() {
    const {
      dimensionId, scrollBlocks,
      numberFormat, geotiff,
      colorThresholds, colorRange, threshold,
      userLocation, cabinet: {t}, data, ...rest
    } = this.props;
    const {geoJson} = rest.geoData;

    const userAgs = userLocation ? userLocation.get('no2Ags') || userLocation.get('id') : undefined;

    const colorScale = scaleThreshold()
      .domain(String(colorThresholds).split(','))
      .range(String(colorRange).split(','));

    function visualization(node, isInterleaved, width, height, reservedTextWidth) {
      if (!geoJson) {
        return rest.geoData.error || null;
      }

      return (
        <MapDotsVisualization
          isInterleaved={isInterleaved}
          width={width}
          height={height}
          reservedTextWidth={reservedTextWidth}
          dimensionId={dimensionId}
          threshold={threshold}
          {...node.parameters}
          colorScale={colorScale}
          t={t}
          points={data}
          geoJson={geoJson}
          geotiff={getGeotiff(geotiff)}
          numberFormat={getFormat(numberFormat, t)}
          userAgs={userAgs} />
      );
    }

    const extraZoneVisitors = {
      No2Stats(node, index) {
        return (
          <No2Stats
            key={index}
            t={t}
            node={node}
            data={data}
            colorScale={colorScale}
            numberFormat={getFormat(numberFormat, t)}
            userLocation={userLocation}
            userAgs={userAgs} />
        );
      },
    };

    const extraMarkerVisitors = {
      LocationSelect(node, index) {
        return <LocationSelect key={index} t={t} />;
      },
    };

    return (
      <ScrollContainer
        t={t}
        dimensionId={dimensionId}
        scrollBlocks={scrollBlocks}
        visualization={visualization}
        extraZoneVisitors={extraZoneVisitors}
        extraMarkerVisitors={extraMarkerVisitors} />
    );
  }
}

MapDotsScrollContainer.propTypes = {
  dimensionId: PropTypes.string.isRequired,
  scrollBlocks: PropTypes.array.isRequired,

  // parameters
  geotiff: PropTypes.string.isRequired,
  // D3 number format string
  numberFormat: PropTypes.string.isRequired,
  // The title for the legend which is shown left of the map.
  colorThresholds: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  colorRange: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  threshold: PropTypes.number.isRequired,

  // Redux
  userLocation: PropTypes.any,
  geoData: PropTypes.any.isRequired,
  loadGeoData: PropTypes.func.isRequired,

  // Cabinet
  cabinet: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
  return {
    userLocation: state.flagship.getIn(['location']),
    geoData: geoData('germany').selector(state),
  };
}
function mapDispatchToProps(dispatch) {
  return {
    loadGeoData() {
      return geoData('germany').load(dispatch);
    },
  };
}
function mapContentToProps({data}) {
  return {data};
}

MapDotsScrollContainer.defaultProps = {
  threshold: 40,
  colorThresholds: '10,20,30,40,50,60,70,80',
  // make sure to keep the colors in sync with the geotiff
  colorRange: '#95da3f,#74B917,#3F8800,#005500,#FFDB3E,#D4A500,#987200,#614200,#3B1500'
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withCabinet(mapContentToProps)(MapDotsScrollContainer)
);
