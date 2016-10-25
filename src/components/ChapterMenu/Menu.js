import React, {Component, PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {Link as RouterLink} from 'react-router';
import Link from 'components/ButtonLink/Link';
import {base as linkBaseStyle} from 'components/ButtonLink/Styles';

import {CONTENT_PADDING, MediumContainer} from 'components/Grid/Grid';
import CloseIcon from 'components/Icons/Close';
import {ChevronUpIcon12, DownloadIcon} from 'components/Icons/Icons';

import {sansRegular16, sansRegular22, sansBold16, sansBold12, sansBold13, serifRegular26} from 'theme/typeface';
import {text, link, white, black, softGrey, midGrey, softBeige} from 'theme/constants';
import {dimensionBackgroundColorStyle, dimensionTextColorStyle} from 'theme/colors';
import {createMediaQuery, onlyS, m} from 'theme/mediaQueries';
import {zIndexOverlay} from 'theme/zIndex';

import {allDimensionIds, dimensionTitle} from 'utils/dimension';
import {allExtraChapterIds, extraChapterShortTitleTranslationKey} from 'utils/extra-chapter';
import {shallowEqual} from 'utils/shallowEqual';

const blockHeight = 96;

const closeIconContainerSize = 32;
const closeIconSize = 9; // Keep in sync with the SVG image!

const styles = StyleSheet.create({
  root: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    backgroundColor: 'rgba(0,0,0,.6)',
    overflowY: 'scroll',

    zIndex: zIndexOverlay,
  },

  top: {
    backgroundColor: white,
    borderBottom: `1px solid ${softGrey}`,

    [m]: {
      padding: '32px 40px',
    },
  },

  title: {
    position: 'relative',
    height: 40,
    opacity: 1,

    [onlyS]: {
      ...sansBold12,
      color: black,
      textTransform: 'uppercase',
      paddingTop: 10,
      cursor: 'pointer'
    },
    [m]: {
      ...serifRegular26,
      color: text,
      height: 'auto',
      paddingBottom: 32,
      textAlign: 'center',
    }
  },
  upIcon: {
    position: 'absolute',
    top: 10,
    right: 0,
    textAlign: 'right',
    [m]: {
      display: 'none'
    }
  },
  closeIcon: {
    position: 'absolute',
    top: -(closeIconContainerSize - closeIconSize) / 2,
    right: -(closeIconContainerSize - closeIconSize) / 2,
    width: closeIconContainerSize,
    height: closeIconContainerSize,
    lineHeight: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    cursor: 'pointer',
    [onlyS]: {
      display: 'none'
    }
  },

  blockContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',

    [m]: {
      margin: `0 -${CONTENT_PADDING}px`,
    }
  },

  block: {
    width: '100%',
    marginBottom: -1,

    textDecoration: 'none',

    padding: '4px 0',
    [createMediaQuery(640, 1024 - 1)]: {
      padding: 4,
      marginBottom: 0,
      width: `${100 / 2}%`,
    },
    [createMediaQuery(1024, Infinity)]: {
      padding: 4,
      marginBottom: 0,
      width: `${100 / 3}%`,
    },
  },
  blockInner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 64,

    borderRadius: 2,
    backgroundColor: softBeige,
    paddingTop: 8,
    paddingBottom: 8,

    [onlyS]: {
      paddingRight: 10,
      marginLeft: -10,
      marginRight: -10
    },

    [m]: {
      height: blockHeight,
      flexDirection: 'column',
      paddingRight: 40,
      paddingLeft: 40
    },
  },
  extraChapterBlockInner: {
    backgroundColor: 'transparent',

    [onlyS]: {
      paddingLeft: 26 + 20
    }
  },
  pdfBlockInner: {
    ...sansBold13,
    justifyContent: 'center',
    [onlyS]: {
      marginLeft: -20,
      marginRight: -20,
      paddingRight: 0
    }
  },
  pdf: {
    ...linkBaseStyle,
    textTransform: 'uppercase',
    display: 'block',
    width: '100%',
    [m]: {
      display: 'none'
    }
  },

  blockId: {
    ...sansRegular22,
    color: midGrey,

    width: 26 + 20,
    height: 32,
    borderRadius: '0 2px 2px 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,

    [m]: {
      position: 'static',
      width: 26,
      margin: '8px 0 -8px',
      borderRadius: 2,
    },
  },

  blockTitle: {
    ...sansRegular16,
    color: text,
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',

    [m]: {
      textAlign: 'center',
    },
  },
  highlightedBlockTitle: {
    [onlyS]: {
      ...sansBold16
    },
  },
  highlightedExtraChapterBlockTitle: {
    textDecoration: 'underline',
    color: link,
  }
});


class MenuItem extends Component { // eslint-disable-line
  constructor(props) {
    super(props);

    this.onMouseEnter = () => {
      this.props.highlightChapter(this.props.chapterId);
    };
    this.onMouseLeave = () => {
      this.props.highlightChapter(undefined);
    };
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  render() {
    const {to, children} = this.props;

    return (
      <RouterLink className={css(styles.block)} to={to} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        {children}
      </RouterLink>
    );
  }
}

MenuItem.propTypes = {
  children: PropTypes.node,
  chapterId: PropTypes.string.isRequired,
  highlightChapter: PropTypes.func.isRequired,
  to: PropTypes.string.isRequired,
};


function DimensionMenuItem({t, dimensions, dimensionId, highlightChapter, style}) { // eslint-disable-line
  return (
    <MenuItem key={dimensionId} to={t(`route/report-${dimensionId}`)} chapterId={dimensionId} highlightChapter={highlightChapter}>
      <div className={style.innerBlock}>
        <div className={style.blockId}>{+dimensionId}</div>
        <div className={style.blockTitle}>
          {dimensionTitle(dimensions, dimensionId)}
        </div>
      </div>
    </MenuItem>
  );
}

function ExtraChapterMenuItem({t, extraChapterId, highlightChapter, style}) { // eslint-disable-line
  return (
    <MenuItem key={extraChapterId} to={t(`route/extra-chapter-${extraChapterId}`)} chapterId={extraChapterId} highlightChapter={highlightChapter}>
      <div className={style.innerBlock}>
        <div className={style.blockTitle}>
          {t(extraChapterShortTitleTranslationKey(extraChapterId))}
        </div>
      </div>
    </MenuItem>
  );
}


class ChapterMenu extends Component { // eslint-disable-line
  constructor(props) {
    super(props);

    this.state = {highlightedChapterId: undefined};
    this.highlightChapter = highlightedChapterId => {
      this.setState({highlightedChapterId});
    };

    [true, false].forEach(isHighlighted => {
      this.extraChapterStyle(isHighlighted);

      allDimensionIds.forEach(dimensionId => {
        this.dimensionChapterStyle(dimensionId, isHighlighted);
      });
    });

    this.onKeyUp = (event) => {
      if (event.keyCode === 27) {
        this.props.close();
      }
    };
  }
  componentDidMount() {
    document.addEventListener('keyup', this.onKeyUp, false);
  }
  componentWillUnmount() {
    document.removeEventListener('keyup', this.onKeyUp, false);
  }

  dimensionChapterStyle(dimensionId, isHighlighted) {
    return {
      innerBlock: css(styles.blockInner, isHighlighted && dimensionBackgroundColorStyle(dimensionId), isHighlighted && dimensionTextColorStyle(dimensionId)),
      blockId: css(styles.blockId, isHighlighted && dimensionBackgroundColorStyle(dimensionId), isHighlighted && dimensionTextColorStyle(dimensionId)),
      blockTitle: css(styles.blockTitle, isHighlighted && styles.highlightedBlockTitle, isHighlighted && dimensionTextColorStyle(dimensionId)),
    };
  }

  extraChapterStyle(isHighlighted) {
    return {
      innerBlock: css(styles.blockInner, styles.extraChapterBlockInner),
      blockTitle: css(styles.blockTitle, isHighlighted && styles.highlightedExtraChapterBlockTitle, isHighlighted && styles.highlightedBlockTitle)
    };
  }

  render() {
    const {t, dimensions, chapterId, close} = this.props;
    const {highlightedChapterId} = this.state;

    return (
      <div className={css(styles.root)} onClick={close}>
        <div className={css(styles.top)}>
          <MediumContainer>
            <div className={css(styles.title)}>
              {t('chapter-nav/title')}
              <div onClick={close} className={css(styles.closeIcon)}><CloseIcon /></div>
              <div onClick={close} className={css(styles.upIcon)}><ChevronUpIcon12 color={black} /></div>
            </div>

            <div className={css(styles.blockContainer)}>
              {allDimensionIds.map(dimensionId => {
                const isHighlighted = chapterId === dimensionId || highlightedChapterId === dimensionId;
                const style = this.dimensionChapterStyle(dimensionId, isHighlighted);

                return (
                  <DimensionMenuItem
                    key={dimensionId}
                    t={t}
                    dimensions={dimensions}
                    dimensionId={dimensionId}
                    highlightChapter={this.highlightChapter}
                    style={style} />
                );
              })}
            </div>

            <div className={css(styles.blockContainer)}>
              {allExtraChapterIds.map(extraChapterId => {
                const isHighlighted = chapterId === extraChapterId || highlightedChapterId === extraChapterId;
                const style = this.extraChapterStyle(isHighlighted);

                return (
                  <ExtraChapterMenuItem
                    key={extraChapterId}
                    t={t}
                    extraChapterId={extraChapterId}
                    isHighlighted
                    highlightChapter={this.highlightChapter}
                    style={style} />
                );
              })}

              <Link className={css(styles.pdf)} t={t} target='_blank' href={t('share/report/href')}>
                <div className={css(styles.blockInner, styles.pdfBlockInner)}>
                  <DownloadIcon color={black} style={{verticalAlign: 'text-top', marginRight: 8}} />
                  {t('chapter-nav/pdf-download')}
                </div>
              </Link>
            </div>
          </MediumContainer>
        </div>
      </div>
    );
  }
}

ChapterMenu.propTypes = {
  t: PropTypes.func.isRequired,
  dimensions: PropTypes.array.isRequired,
  chapterId: PropTypes.string.isRequired, // DimensionId | ExtraChapterId
  close: PropTypes.func.isRequired,
};

export default ChapterMenu;
