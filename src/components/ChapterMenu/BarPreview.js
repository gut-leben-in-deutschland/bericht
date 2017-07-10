import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {withCabinet} from 'cabinet';

import {ChapterMenuBar} from 'components/ChapterMenu/Bar';


class _ChapterMenuBarPreview extends Component {
  render() {
    const {cabinet: {t}, chapterId, progress, dimensions, isOpen} = this.props;
    return (
      <ChapterMenuBar t={t} dimensions={dimensions}
        chapterId={chapterId} progress={progress} isOpen={isOpen} opacity={1} />
    );
  }
}

_ChapterMenuBarPreview.propTypes = {
  chapterId: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  cabinet: PropTypes.object.isRequired,
  dimensions: PropTypes.any.isRequired,
};

export const ChapterMenuBarPreview = withCabinet(({cabinet: {locale}}) => ({
  dimensions: `dimensions.${locale}.csv`,
}))(_ChapterMenuBarPreview);
