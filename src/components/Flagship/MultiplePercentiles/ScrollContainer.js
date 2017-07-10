import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {withCabinet} from 'cabinet';
import {connect} from 'react-redux';
import {StyleSheet, css} from 'aphrodite';

import {MultiplePercentilesVisualization, getHeight} from './Visualization';
import {ScrollContainer} from 'components/Flagship/ScrollContainer';
import {DesiredWorkingHours, ActualWorkingHours} from './WorkingHours';
import WorkingHoursStats from './WorkingHoursStats';

import {m as mUp} from 'theme/mediaQueries';

import {shallowEqual} from 'utils/shallowEqual';


const styles = StyleSheet.create({
  workingHours: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',

    [mUp]: {
      flexDirection: 'row',
    },
  },
  workingHoursItem: {
    marginTop: 8,

    [mUp]: {
      width: '48%',
    },
  },
});

class _MultiplePercentilesScrollContainer extends Component {
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }
  render() {
    const {dimensionId, scrollBlocks, cabinet: {t}, data, desiredWorkingHours,
      actualWorkingHours} = this.props;

    const visualizationProps = (node, isInterleaved, width, height, reservedTextWidth) => ({
      t,
      isInterleaved,
      width,
      height,
      reservedTextWidth,
      stage: node.parameters.stage,
      tooltips: node.parameters.tooltips,
      dimensionId,
      data,
      desiredWorkingHours,
      actualWorkingHours
    });
    const visualization = (...args) => {
      return (
        <MultiplePercentilesVisualization {...visualizationProps(...args)} />
      );
    };
    const visualizationHeight = (...args) => {
      return getHeight(visualizationProps(...args));
    };

    const extraZoneVisitors = {
      WorkingHoursStats(node, index) {
        return (
          <WorkingHoursStats
            key={index}
            node={node}
            t={t}
            desiredWorkingHours={desiredWorkingHours}
            actualWorkingHours={actualWorkingHours} />
        );
      },
    };

    const extraMarkerVisitors = {
      WorkingHours(node, index) {
        return (
          <div key={index} className={css(styles.workingHours)}>
            <div className={css(styles.workingHoursItem)}>
              <DesiredWorkingHours t={t} />
            </div>
            <div className={css(styles.workingHoursItem)}>
              <ActualWorkingHours t={t} />
            </div>
          </div>
        );
      },
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

_MultiplePercentilesScrollContainer.propTypes = {
  dimensionId: PropTypes.string.isRequired,
  scrollBlocks: PropTypes.array.isRequired,

  // Redux
  desiredWorkingHours: PropTypes.number,
  actualWorkingHours: PropTypes.number,

  // Cabinet
  cabinet: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
};


function mapStateToProps(state) {
  return {
    desiredWorkingHours: state.flagship.get('desiredWorkingHours'),
    actualWorkingHours: state.flagship.get('actualWorkingHours'),
  };
}
function mapDispatchToProps() {
  return {
  };
}
function mapContentToProps({data}) {
  return {
    data
  };
}

export const MultiplePercentilesScrollContainer
  = connect(mapStateToProps, mapDispatchToProps)(
      withCabinet(mapContentToProps)(_MultiplePercentilesScrollContainer));
