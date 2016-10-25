import React, {PropTypes, Component} from 'react';
import {withCabinet} from 'cabinet';
import Dimensions from 'react-dimensions';
import {connect} from 'react-redux';

import {DistrictsVisualization} from './Visualization';
import {getFormat} from 'components/Chart/utils';
import geoData from 'utils/geoData';

class _Inner extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.props.loadGeoData();
  }
  render() {
    const {containerWidth, containerHeight, height, dimensionId, view, data} // eslint-disable-line
        = this.props;

    const {geoJson, name} = this.props.geoData;
    if (!geoJson) {
      return null;
    }

    return (
      <DistrictsVisualization
        {...this.props}
        geoJson={geoJson}
        isInterleaved={false}
        width={containerWidth}
        height={containerHeight}
        reservedTextWidth={400}
        startYear='2005'
        endYear='2015'
        numberFormat={getFormat('.1%')}
        diffFormat={getFormat('+.1%')}
        districtName={name}
        geography={2015}
        legendTitle='Legendary Numbers' />
    );
  }
}
const Inner = Dimensions()(_Inner);

_Inner.propTypes = {
  geoData: PropTypes.object.isRequired,
  loadGeoData: PropTypes.func.isRequired
};

function _DistrictsVisualizationPreview(props) {
  return (
    <div style={{width: '100%', height: props.height, flexGrow: 1}}>
      <Inner {...props} />
    </div>
  );
}

_DistrictsVisualizationPreview.propTypes = {
  height: PropTypes.number.isRequired
};

function mapStateToProps(state) {
  return {
    geoData: geoData('krs-2015').selector(state),
  };
}
function mapDispatchToProps(dispatch) {
  return {
    loadGeoData() {
      return geoData('krs-2015').load(dispatch);
    },
  };
}
function mapContentToProps() {
  return {districtData: '02/01/districts.csv'};
}

export const DistrictsVisualizationPreview = connect(mapStateToProps, mapDispatchToProps)(
  withCabinet(mapContentToProps)(_DistrictsVisualizationPreview)
);
