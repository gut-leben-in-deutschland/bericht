import React, {PropTypes, Component} from 'react';
import {withCabinet} from 'cabinet';
import {connect} from 'react-redux';

import {DistrictsVisualization} from './Visualization';
import {getFormat, BKGLegend} from 'components/Chart/utils';
import DistrictsStats from './DistrictsStats';
import {ScrollContainer} from 'components/Flagship/ScrollContainer';
import LocationSelect from 'components/Flagship/LocationSelect';

import geoData from 'utils/geoData';
import {shallowEqual} from 'utils/shallowEqual';


class _DifferenceBarScrollContainer extends Component {
  componentDidMount() {
    this.props.loadGeoData();
  }
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }
  render() {
    const {
      dimensionId, scrollBlocks,
      startYear, endYear,
      userLocation, cabinet: {t}, data, ...rest
    } = this.props;
    const {geoJson, agsMapper, name} = rest.geoData;

    const numberFormat = getFormat(this.props.numberFormat, t);
    const diffFormat = getFormat(this.props.diffFormat, t);

    function visualization(node, isInterleaved, width, height, reservedTextWidth) {
      if (!geoJson) {
        return rest.geoData.error || null;
      }

      return (
        <DistrictsVisualization
          isInterleaved={isInterleaved}
          width={width}
          height={height}
          reservedTextWidth={reservedTextWidth}
          dimensionId={dimensionId}
          stage={node.parameters.stage}
          parameters={node.parameters}
          legendTitle={t(`flagship/difference-bars/${dimensionId}/legend-title`)}
          xAxisLeft={t(`flagship/difference-bars/${dimensionId}/x-axis/left`)}
          xAxisRight={t(`flagship/difference-bars/${dimensionId}/x-axis/right`)}
          districtData={data}
          startYear={String(startYear)}
          endYear={String(endYear)}
          geoJson={geoJson}
          districtName={name}
          numberFormat={numberFormat}
          diffFormat={diffFormat}
          userDistrictId={userLocation && agsMapper(userLocation.get('id'))} />
      );
    }

    const extraZoneVisitors = {
      DistrictsStats(node, index) {
        return (
          <DistrictsStats
            key={index}
            t={t}
            node={node}
            data={data}
            endYear={String(endYear)}
            numberFormat={numberFormat}
            userLocation={userLocation}
            geoData={rest.geoData} />
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
        secondarySource={dimensionId !== '01' && <BKGLegend t={t} />}
        extraZoneVisitors={extraZoneVisitors}
        extraMarkerVisitors={extraMarkerVisitors} />
    );
  }
}

_DifferenceBarScrollContainer.propTypes = {
  dimensionId: PropTypes.string.isRequired,
  scrollBlocks: PropTypes.array.isRequired,

  // parameters
  startYear: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  endYear: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  numberFormat: PropTypes.string.isRequired,
  diffFormat: PropTypes.string.isRequired,

  // Redux
  userLocation: PropTypes.any,
  geoData: PropTypes.any.isRequired,
  loadGeoData: PropTypes.func.isRequired,

  // Cabinet
  cabinet: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
};


function mapStateToProps(state, {geography}) {
  return {
    userLocation: state.flagship.getIn(['location']),
    geoData: geoData(`krs-${geography}`).selector(state),
  };
}
function mapDispatchToProps(dispatch, {geography}) {
  return {
    loadGeoData() {
      return geoData(`krs-${geography}`).load(dispatch);
    },
  };
}
function mapContentToProps({data}) {
  return {data};
}

export const DifferenceBarScrollContainer
  = connect(mapStateToProps, mapDispatchToProps)(
      withCabinet(mapContentToProps)(_DifferenceBarScrollContainer));

DifferenceBarScrollContainer.defaultProps = {
  geography: 2015,
  numberFormat: '.1%',
  diffFormat: '+.1%',
};

DifferenceBarScrollContainer.propTypes = {
  geography: PropTypes.any.isRequired
};
