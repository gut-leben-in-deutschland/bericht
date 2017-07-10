import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet, css} from 'aphrodite';

import {Container} from 'components/Grid/Grid';
import {ChevronDownIcon12, DownloadIcon} from 'components/Icons/Icons';

import {sansBold12} from 'theme/typeface';
import {white, extraChapterColor} from 'theme/constants';
import {dimensionBackgroundColorStyle, dimensionTextColorStyle} from 'theme/colors';
import {onlyS, m} from 'theme/mediaQueries';

import {allDimensionIds, dimensionTitle, dimensionTextColor} from 'utils/dimension';
import {extraChapterShortTitleTranslationKey} from 'utils/extra-chapter';
import Link from 'components/ButtonLink/Link';
import {base as linkBaseStyle} from 'components/ButtonLink/Styles';

export const topBarHeight = 40;
const progressBarTopMargin = 1;
const progressBarHeight = 4;

export const chapterMenuBarHeight =
  topBarHeight + progressBarTopMargin + progressBarHeight;

const styles = StyleSheet.create({
  top: {
    ...sansBold12,

    position: 'relative',
    width: '100%',

    cursor: 'pointer',
  },
  topInner: {
    height: topBarHeight,
  },
  topBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: -1,
  },
  icon: {
    [onlyS]: {
      display: 'flex',
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'flex-end',
      right: 0,
      top: 0,
      bottom: 0,
    },
    [m]: {
      margin: '0 10px',
    }
  },
  title: {
    position: 'absolute',
    top: 0,
    right: 20,
    bottom: 0,
    left: 20,
    lineHeight: '40px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    minWidth: 0,
    textOverflow: 'ellipsis',
    paddingRight: 20,
    textTransform: 'uppercase',
    [m]: {
      textAlign: 'center',
      paddingRight: 0,
    },
    ':hover': {
      opacity: 0.5
    }
  },
  pdf: {
    ...linkBaseStyle,
    ...sansBold12,
    position: 'absolute',
    top: 0,
    right: 20,
    width: 160,
    bottom: 0,
    textTransform: 'uppercase',
    lineHeight: '40px',
    textAlign: 'right',
    [onlyS]: {
      display: 'none'
    },
    ':hover': {
      opacity: 0.5
    }
  },

  progressBarContainer: {
    marginTop: progressBarTopMargin,
    height: progressBarHeight,
    position: 'relative',
  },
  progressBarBackdrop: {
    height: progressBarHeight,
    position: 'absolute',
    opacity: 0.25,
    width: '100%',
  },
  progressBar: {
    height: progressBarHeight,
    position: 'absolute',
  }
});

function backgroundColorStyle(chapterId) {
  if (allDimensionIds.indexOf(chapterId) >= 0) {
    return dimensionBackgroundColorStyle(chapterId);
  }

  return StyleSheet.create({style: {backgroundColor: extraChapterColor}}).style;
}

function textColor(chapterId) {
  if (allDimensionIds.indexOf(chapterId) >= 0) {
    return dimensionTextColor(chapterId);
  }

  return white;
}

function textColorStyle(chapterId) {
  if (allDimensionIds.indexOf(chapterId) >= 0) {
    return dimensionTextColorStyle(chapterId);
  }

  return StyleSheet.create({style: {color: white}}).style;
}

function title(t, dimensions, chapterId) {
  if (allDimensionIds.indexOf(chapterId) >= 0) {
    return dimensionTitle(dimensions, chapterId);
  }

  return t(extraChapterShortTitleTranslationKey(chapterId));
}

export function ChapterMenuBar({t, dimensions, chapterId, progress}) {
  return (
    <div>
      <div className={css(styles.top, textColorStyle(chapterId))}>
        <div className={css(styles.topBackground, backgroundColorStyle(chapterId))} />

        <Container>
          <div className={css(styles.topInner)}>
            <div className={css(styles.title)}>
              {title(t, dimensions, chapterId)}
              <span className={css(styles.icon)}>
                <ChevronDownIcon12 color={textColor(chapterId)} />
              </span>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <Link t={t} href={t('share/report/href')} title={t('share/report/title')} className={css(styles.pdf)}>
                {t('chapter-nav/pdf-download')}
                <DownloadIcon color={textColor(chapterId)} style={{verticalAlign: 'text-top', marginLeft: 8}} />
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <div className={css(styles.progressBarContainer)}>
        <div className={css(styles.progressBarBackdrop, backgroundColorStyle(chapterId))} />
        <div className={css(styles.progressBar, backgroundColorStyle(chapterId))} style={{width: `${progress * 100}%`}}/>
      </div>
    </div>
  );
}

ChapterMenuBar.propTypes = {
  t: PropTypes.func.isRequired,
  dimensions: PropTypes.array.isRequired,
  chapterId: PropTypes.string.isRequired, // DimensionId | ExtraChapterId
  progress: PropTypes.number.isRequired, // Between 0 and 1
};
