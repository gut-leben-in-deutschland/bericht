import React, {PropTypes, Component} from 'react';
import {withCabinet} from 'cabinet';

import ChapterMenu from 'components/ChapterMenu/Menu';


class _ChapterMenuPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {chapterId: '01'};
  }

  render() {
    const {cabinet: {t}, height, dimensions} = this.props;
    const {chapterId} = this.state;

    return (
      <div style={{height}}>
        <ChapterMenu t={t} dimensions={dimensions}
          chapterId={chapterId}
          close={() => {}} />
      </div>
    );
  }
}

_ChapterMenuPreview.propTypes = {
  height: PropTypes.number.isRequired,
  cabinet: PropTypes.object.isRequired,
  dimensions: PropTypes.any.isRequired,
};

export const ChapterMenuPreview = withCabinet(({cabinet: {locale}}) => ({
  dimensions: `dimensions.${locale}.csv`,
}))(_ChapterMenuPreview);
