import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet, css} from 'aphrodite';
import {withCabinet} from 'cabinet';

import {MobileDetailView} from 'components/LandingPage/Mobile/MobileDetailView';


const styles = StyleSheet.create({
  root: {
    position: 'relative',
    height: 600,
  },
});

function _MobileDetailViewPreview({t, dimensions}) {
  return (
    <div className={css(styles.root)}>
      <MobileDetailView
        t={t}
        dimensions={dimensions}
        dimensionId={'12'}
        gotoNext={() => {}}
        gotoPrevious={() => {}}
        onClose={() => {}} />
    </div>
  );
}

_MobileDetailViewPreview.propTypes = {
  t: PropTypes.func.isRequired,
  dimensions: PropTypes.any.isRequired,
};

export const MobileDetailViewPreview = withCabinet(({cabinet: {t, locale}}) => ({
  dimensions: `dimensions.${locale}.csv`,
  t: t,
}))(_MobileDetailViewPreview);
