import React, {PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {withCabinet} from 'cabinet';

import SearchBar, {optionRenderer} from 'components/Indicator/SearchBar';

import {onlyS} from 'theme/mediaQueries';


const styles = StyleSheet.create({
  searchBarPreview: {
    backgroundColor: '#F6F6F0',

    [onlyS]: {
      minHeight: 400,
    },
  },
});

function _SearchBarPreview({cabinet: {t}, dimensions, indicators}) {
  return (
    <div className={css(styles.searchBarPreview)}>
      <SearchBar t={t} locale={'de'} dimensions={dimensions} indicators={indicators} />
    </div>
  );
}

_SearchBarPreview.propTypes = {
  cabinet: PropTypes.object.isRequired,
  dimensions: PropTypes.array.isRequired,
  indicators: PropTypes.array.isRequired,
};

export const SearchBarPreview = withCabinet(({cabinet: {locale}}) => ({
  dimensions: `dimensions.${locale}.csv`,
  indicators: `indicators.${locale}.csv`
}))(_SearchBarPreview);


export function OptionRendererPreview({needle, title, subLabel}) {
  return optionRenderer('de', needle)({value: {location: '#', title, subLabel}});
}
