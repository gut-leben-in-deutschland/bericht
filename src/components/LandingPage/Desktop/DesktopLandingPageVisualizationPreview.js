import React, {PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {withCabinet} from 'cabinet';

import {DesktopLandingPageVisualization} from 'components/LandingPage/Desktop/DesktopLandingPageVisualization';

import {softBeige} from 'theme/constants';


const nop = () => {};

const styles = StyleSheet.create({
  root: {
    backgroundColor: 'magenta'
  },
  spacer: {
    height: 200
  },
  container: {
    backgroundColor: softBeige,
    height: 768,
    position: 'relative',
    display: 'flex'
  }
});

function _DesktopLandingPageVisualizationPreview({cabinet: {t}, stageIndex, originalStageIndex, dimensions, indicators}) {
  return (
    <div className={css(styles.root)}>
      <div className={css(styles.spacer)} />
      <div className={css(styles.container)}>
        <DesktopLandingPageVisualization
          t={t}
          vis={'Bottom'}
          originalStageIndex={originalStageIndex}
          stageIndex={stageIndex}
          dimensions={dimensions}
          indicators={indicators}
          hoverDimension={nop}
          selectDimension={nop}
          hoverIndicator={nop}
          hoverIndicatorId={undefined} />
      </div>
      <div className={css(styles.spacer)} />
    </div>
  );
}

_DesktopLandingPageVisualizationPreview.propTypes = {
  cabinet: PropTypes.object.isRequired,
  stageIndex: PropTypes.any.isRequired,
  originalStageIndex: PropTypes.any.isRequired,
  dimensions: PropTypes.any.isRequired,
  indicators: PropTypes.any.isRequired,
};

export const DesktopLandingPageVisualizationPreview = withCabinet(({cabinet: {locale}}) => ({
  dimensions: `dimensions.${locale}.csv`,
  indicators: `indicators.${locale}.csv`,
}))(_DesktopLandingPageVisualizationPreview);
