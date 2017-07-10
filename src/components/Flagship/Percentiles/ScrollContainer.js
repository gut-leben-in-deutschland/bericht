import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {withCabinet} from 'cabinet';
import {connect} from 'react-redux';

import {PercentilesVisualization, getHeight} from './Visualization';
import {ScrollContainer} from 'components/Flagship/ScrollContainer';
import AnnualIncome from './AnnualIncome';
import FamilySize from './FamilySize';
import LeisureTime from './LeisureTime';
import {createSelector} from 'reselect';

import {shallowEqual} from 'utils/shallowEqual';

class _PercentilesScrollContainer extends Component {
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }
  render() {
    const {
      dimensionId, scrollBlocks,
      cabinet: {t},
      data, userValue,
      numberFormat
    } = this.props;

    const visualizationProps = (node, isInterleaved, width, height, reservedTextWidth) => ({
      isInterleaved,
      width,
      height,
      reservedTextWidth,
      stage: node.parameters.stage,
      tooltips: node.parameters.tooltips,
      dimensionId,
      data,
      centerText: t(`flagship/percentiles/${dimensionId}/center-text`),
      ourLabel: t(`flagship/percentiles/${dimensionId}/our-label`),
      lowerLabel: t(`flagship/percentiles/${dimensionId}/lower-label`),
      higherLabel: t(`flagship/percentiles/${dimensionId}/higher-label`),
      leftAxisLabel: t(`flagship/percentiles/${dimensionId}/left-axis-label`),
      rightAxisLabel: t(`flagship/percentiles/${dimensionId}/right-axis-label`),
      userValue,
      numberFormat,
      unit: t(`flagship/percentiles/${dimensionId}/unit`),
      t
    });
    const visualization = (...args) => {
      return (
        <PercentilesVisualization {...visualizationProps(...args)} />
      );
    };
    const visualizationHeight = (...args) => {
      return getHeight(visualizationProps(...args));
    };

    const extraZoneVisitors = {
    };

    const extraMarkerVisitors = {
      AnnualIncome(node, index) {
        return <AnnualIncome key={index} t={t} />;
      },
      FamilySize(node, index) {
        return <FamilySize key={index} t={t} />;
      },
      LeisureTime(node, index) {
        return <LeisureTime key={index} t={t} />;
      }
    };

    return (
      <ScrollContainer
        t={t}
        dimensionId={dimensionId}
        scrollBlocks={scrollBlocks}
        visualization={visualization}
        visualizationHeight={visualizationHeight}
        extraZoneVisitors={extraZoneVisitors}
        extraMarkerVisitors={extraMarkerVisitors} />
    );
  }
}

_PercentilesScrollContainer.propTypes = {
  dimensionId: PropTypes.string.isRequired,
  scrollBlocks: PropTypes.array.isRequired,
  numberFormat: PropTypes.string.isRequired,

  // Redux
  userValue: PropTypes.number,

  // Cabinet
  cabinet: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
};

_PercentilesScrollContainer.defaultProps = {
  numberFormat: ',d'
};

const userValueSelector = createSelector(
  (state, props) => props.dimensionId,
  state => state.flagship.get('leisureTime'),
  state => state.flagship.get('annualIncome', undefined),
  state =>  state.flagship.get('numAdults'),
  state =>  state.flagship.get('numChildren'),
  (dimensionId, leisureTime, annualIncome, numAdults, numChildren) => {
    switch (dimensionId) {
    case '05': {
      if (annualIncome === undefined) {
        return undefined;
      }
      let numAdditionalAdults = Math.max(numAdults - 1, 0);
      let numAdditionalChildren = numChildren - (numAdults < 1 ? 1 : 0);
      // OECD-modified scale: http://www.oecd.org/eco/growth/OECD-Note-EquivalenceScales.pdf
      return annualIncome / (1 + numAdditionalAdults * 0.5 + numAdditionalChildren * 0.3);
    }
    case '08':
      return leisureTime;
    default:
      return undefined;
    }
  }
);

function mapStateToProps(state, props) {
  return {
    userValue: userValueSelector(state, props)
  };
}
function mapContentToProps({data}) {
  return {
    data
  };
}

export const PercentilesScrollContainer = connect(mapStateToProps)(
  withCabinet(mapContentToProps)(_PercentilesScrollContainer)
);
