import React, {Component, PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';

import {chapterMenuBarHeight, ChapterMenuBar} from 'components/ChapterMenu/Bar';

import {zIndexOverlay, zIndexSticky} from 'theme/zIndex';

import {scrollY, passiveEvent} from 'utils/dom';


const styles = StyleSheet.create({
  root: {
    height: chapterMenuBarHeight,
  },
  cover: {
    marginBottom: -chapterMenuBarHeight,
  },

  isOpen: {
    zIndex: zIndexOverlay + 1,
    display: 'none',
  },

  sticky: {
    zIndex: zIndexSticky,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0.95,
  },
});

class ChapterMenuBarContainer extends Component {
  constructor(props) {
    super(props);

    this.ref = undefined;
    this.state = {isSticky: false, progress: 0};

    this.onScroll = () => {
      if (this.ref === undefined) {
        this.setState({isSticky: false, progress: 0});
      } else {
        const top = this.ref.getBoundingClientRect().top;
        const isSticky = top < 0;
        const windowTopOffset = scrollY();
        const topOffset = windowTopOffset + top;

        const progress = isSticky === false
          ? 0
          : (windowTopOffset - topOffset) / (document.body.clientHeight - window.innerHeight - topOffset);

        this.setState({isSticky, progress});
      }
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll, passiveEvent());
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  render() {
    const {isOpen, onClick, cover, ...passthroughProps} = this.props;
    const {isSticky, progress} = this.state;

    return (
      <div ref={ref => { this.ref = ref; }} className={css(styles.root, cover && styles.cover)}>
        <div className={css((isOpen || isSticky) ? styles.sticky : undefined, isOpen ? styles.isOpen : undefined)} onClick={onClick}>
          <ChapterMenuBar {...passthroughProps} progress={progress} />
        </div>
      </div>
    );
  }
}

ChapterMenuBarContainer.propTypes = {
  t: PropTypes.func.isRequired,
  dimensions: PropTypes.array.isRequired,
  chapterId: PropTypes.string.isRequired, // DimensionId | ReportChapterId
  isOpen: PropTypes.bool.isRequired, // True if the menu is currently open
  onClick: PropTypes.func.isRequired,
  cover: PropTypes.bool
};

export default ChapterMenuBarContainer;
