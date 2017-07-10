import PropTypes from 'prop-types';
import React from 'react';
import {withCabinet} from 'cabinet';

import {TableOfContentsBody} from 'components/LandingPage/Desktop/TableOfContentsBody';


function _TableOfContentsPreview({cabinet: {t}, dimensions}) {
  return (
    <TableOfContentsBody
      t={t}
      dimensions={dimensions}
      selectedDimensionId={'02'}
      selectDimension={() => {}} />
  );
}

_TableOfContentsPreview.propTypes = {
  cabinet: PropTypes.any.isRequired,
  dimensions: PropTypes.any.isRequired
};

export const TableOfContentsPreview = withCabinet(({cabinet: {locale}}) => ({
  dimensions: `dimensions.${locale}.csv`
}))(_TableOfContentsPreview);
