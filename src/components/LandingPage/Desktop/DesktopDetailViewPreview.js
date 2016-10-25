import React, {PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {withCabinet} from 'cabinet';

import {DesktopDetailView} from 'components/LandingPage/Desktop/DesktopDetailView';

import {softBeige} from 'theme/constants';


const styles = StyleSheet.create({
  root: {
    backgroundColor: softBeige,
    height: 600,
    position: 'relative',
    display: 'flex'
  }
});

function _DesktopDetailViewPreview({cabinet: {t}, dimensions, dimensionId}) {
  return (
    <div className={css(styles.root)}>
      <DesktopDetailView t={t} dimensionId={dimensionId} dimensions={dimensions} />
    </div>
  );
}

_DesktopDetailViewPreview.propTypes = {
  cabinet: PropTypes.object.isRequired,
  dimensions: PropTypes.any.isRequired,
  dimensionId: PropTypes.any.isRequired,
};

export const DesktopDetailViewPreview = withCabinet(({cabinet: {locale}}) => ({
  dimensions: `dimensions.${locale}.csv`
}))(_DesktopDetailViewPreview);
