import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';

import {CardList} from 'components/LandingPage/Mobile/CardList';
import {DimensionCardDetail} from 'components/LandingPage/DimensionCardDetail';

import {shallowEqual} from 'utils/shallowEqual';
import {allDimensionIds} from 'utils/dimension';
import {passiveEvent} from 'utils/dom';


const styles = StyleSheet.create({
  scrollIndicator: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    opacity: 0,
    transition: 'opacity .3s',
  },
  visibleScrollIndicator: {
    opacity: 1,
  },
  scrollIndicatorIcon: {
    position: 'fixed',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  cardListContainer: {
    transition: 'opacity .55s',
  },
  introduction: {
    position: 'relative',
    paddingTop: 20,
  },
  overlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: -1,
    opacity: 0,
    transition: 'opacity .2s',
  },
  visibleOverlay: {
    zIndex: 99,
    opacity: 1, // Need to be above the menu icon in the header.
  },
});

const windowEvents = ['scroll', 'resize'];

export class MobileDimensionCards extends Component { // eslint-disable-line
  constructor(props) {
    super(props);

    this.state = {
      viewportWidth: undefined,
      viewportHeight: undefined,

      selectedDimensionId: undefined,
    };

    this.selectDimension = selectedDimensionId => {
      this.setState(previousState =>
        ({...previousState, selectedDimensionId}));
    };
    this.closeOverlay = () => {
      this.setState(previousState =>
        ({...previousState, selectedDimensionId: undefined}));
    };
    this.gotoNext = () => {
      this.setState(previousState => {
        const {selectedDimensionId} = previousState;
        const index = allDimensionIds.indexOf(selectedDimensionId);

        if (index === -1) {
          return {...previousState, selectedDimensionId: allDimensionIds[0]};
        }

        const nextIndex = (index + 1) % allDimensionIds.length;
        return {...previousState, selectedDimensionId: allDimensionIds[nextIndex]};
      });
    };
    this.gotoPrevious = () => {
      this.setState(previousState => {
        const {selectedDimensionId} = previousState;
        const index = allDimensionIds.indexOf(selectedDimensionId);

        if (index === -1) {
          return {...previousState, selectedDimensionId: allDimensionIds[0]};
        }

        const nextIndex = (index - 1 + allDimensionIds.length) % allDimensionIds.length;
        return {...previousState, selectedDimensionId: allDimensionIds[nextIndex]};
      });
    };

    this.updateState = () => {
      this.setState(previousState => {
        return {
          ...previousState,

          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        };
      });
    };
  }

  componentDidMount() {
    this.updateState();
    windowEvents.forEach(e =>
      window.addEventListener(e, this.updateState, passiveEvent()));
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.state, nextState);
  }
  componentWillUnmount() {
    windowEvents.forEach(e =>
      window.removeEventListener(e, this.updateState));
  }

  render() {
    const {t, dimensions} = this.props;
    const {viewportWidth, viewportHeight, selectedDimensionId} = this.state;

    const dimensionCardDetail = selectedDimensionId === undefined ? null : (
      <DimensionCardDetail
        t={t}
        dimensions={dimensions}
        dimensionId={selectedDimensionId}
        viewportWidth={viewportWidth} viewportHeight={viewportHeight}
        gotoPrevious={this.gotoPrevious}
        gotoNext={this.gotoNext}
        onClose={this.closeOverlay} />
    );

    return (
      <div className={css(styles.cardListContainer)}>
        <CardList dimensions={dimensions} selectDimension={this.selectDimension} />
        {dimensionCardDetail}
      </div>
    );
  }
}

MobileDimensionCards.propTypes = {
  t: PropTypes.func.isRequired,
  dimensions: PropTypes.array.isRequired,
};
