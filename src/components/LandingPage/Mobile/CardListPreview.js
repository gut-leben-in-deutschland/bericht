import React, {PropTypes} from 'react';
import {withCabinet} from 'cabinet';

import {CardList} from 'components/LandingPage/Mobile/CardList';


function _CardListPreview({dimensions}) {
  return <CardList dimensions={dimensions} selectDimension={() => {}}/>;
}

_CardListPreview.propTypes = {
  dimensions: PropTypes.any.isRequired,
};

export const CardListPreview = withCabinet(({cabinet: {locale}}) => ({
  dimensions: `dimensions.${locale}.csv`
}))(_CardListPreview);
