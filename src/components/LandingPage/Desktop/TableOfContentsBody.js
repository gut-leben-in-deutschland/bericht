import PropTypes from 'prop-types';
/* eslint-disable react/no-multi-comp */

import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import {Link} from 'react-router';

import BS from 'components/ButtonLink/Styles';
import {ChevronRightIcon12, ChevronLeftIcon12} from 'components/Icons/Icons';

import {sansRegular16, sansBold16} from 'theme/typeface';
import {darkGrey, softGrey, softBeige, text, link} from 'theme/constants';
import {dimensionBackgroundColorStyle, dimensionTextColorStyle} from 'theme/colors';

import {allDimensionIds, dimensionTitle, dimensionTextColor} from 'utils/dimension';
import {shallowEqual} from 'utils/shallowEqual';


const dimensionChapterItemHeight = 64;
const verticalPadding = 8;


const styles = StyleSheet.create({
  root: {
    margin: '12px -15px 0',
  },

  dimensionChapterItem: {
    position: 'relative',
    height: dimensionChapterItemHeight,
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'row',
    marginBottom: verticalPadding,
    borderRadius: 4,
    backgroundColor: softBeige,
  },
  dimensionChapterItemTitle: {
    ...sansRegular16,
    color: text,
    margin: 0,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
  },

  link: {
    ...sansBold16,
    color: link,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textDecoration: 'none',
    transition: 'margin .22s',
    zIndex: 0,
    padding: `0 16px`,

    ':hover': {
      textDecoration: 'underline',
    },
  },
  leftLink: {
    justifyContent: 'flex-start',
  },
  rightLink: {
    justifyContent: 'flex-end',
  },
  icon: {
    position: 'relative',
    top: 1,
  },
  linkLabel: {
    ...sansBold16,

    opacity: 0,
    transition: 'opacity .22s',
    margin: '0 8px',
  },

  // Even though this is a trivial style, can't put it inline because we need
  // to prefix this. Or else it the style of the table of contents misrenders
  // in iOS 8.
  flexGrow1: {
    flexGrow: 1,
  },

  extraChapterItem: {
    ...sansRegular16,
    color: text,

    textDecoration: 'none',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    height: dimensionChapterItemHeight,
    marginBottom: verticalPadding,
    paddingBottom: verticalPadding,

    borderBottom: `1px solid ${softGrey}`,

    ':hover': {
      ...sansBold16,
      color: link,
    },
  },
});

const selectedStyle = StyleSheet.create({
  dimensionChapterItemTitle: {
    ...sansBold16,
  },
  link: {
    zIndex: 3,
  },
  linkLabel: {
    opacity: 1,
  },
});


class DimensionChapterItem extends Component {
  constructor(props) {
    super(props);

    allDimensionIds.forEach(dimensionId  => {
      [true, false].forEach(isSelected => {
        this.style(dimensionId, isSelected);
      });
    });
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  style(dimensionId, isSelected) {
    const textColor = dimensionTextColor(dimensionId);
    const textColorStyle = isSelected
      ? dimensionTextColorStyle(dimensionId)
      : undefined;

    return {
      textColor,
      root: css(styles.dimensionChapterItem, isSelected && dimensionBackgroundColorStyle(dimensionId)),
      title: css(styles.dimensionChapterItemTitle, textColorStyle, isSelected && selectedStyle.dimensionChapterItemTitle),
      leftLink: css(BS.base, styles.link, textColorStyle, styles.leftLink, isSelected && selectedStyle.link),
      rightLink: css(BS.base, styles.link, textColorStyle, styles.rightLink, isSelected && selectedStyle.link),
      linkLabel: css(styles.linkLabel, isSelected && selectedStyle.linkLabel),
    };
  }

  render() {
    const {t, dimensions, dimensionId, selectDimension, isSelected} = this.props;
    const style = this.style(dimensionId, isSelected);

    return (
      <div className={style.root}
        onClick={() => { selectDimension(dimensionId); }}
        onMouseEnter={() => { selectDimension(dimensionId); }}
        onMouseLeave={() => { selectDimension(undefined); }}
        onBlur={() => { selectDimension(undefined); }}>

        <h2 className={style.title}>
          {dimensionTitle(dimensions, dimensionId)}
        </h2>

        <Link to={t(`route/report-${dimensionId}`)} className={style.leftLink}>
          <div className={css(styles.icon)}><ChevronLeftIcon12 color={isSelected ? style.textColor : darkGrey} /></div>
          <div className={style.linkLabel}>
            {t('landing-page/table-of-contents/report-short')}
          </div>
        </Link>

        <div className={css(styles.flexGrow1)} />

        <Link to={t(`route/dimension-${dimensionId}`)} className={style.rightLink}>
          <div className={css(styles.linkLabel, isSelected && selectedStyle.linkLabel)}>
            {t('landing-page/table-of-contents/indicators')}
          </div>
          <div className={css(styles.icon)}><ChevronRightIcon12 color={isSelected ? style.textColor : darkGrey} /></div>
        </Link>
      </div>
    );
  }
}

DimensionChapterItem.propTypes = {
  t: PropTypes.any.isRequired,

  dimensions: PropTypes.any.isRequired,
  dimensionId: PropTypes.any.isRequired,

  isSelected: PropTypes.any.isRequired,
  selectDimension: PropTypes.any.isRequired,
};


class ExtraChapterItem extends Component {
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  render() {
    const {t, extraChapterId} = this.props;

    return (
      <Link to={t(`route/extra-chapter-${extraChapterId}`)} className={css(styles.extraChapterItem)}>
        {t(`extra-chapter-${extraChapterId}/title`)}
      </Link>
    );
  }
}

ExtraChapterItem.propTypes = {
  t: PropTypes.func.isRequired,

  extraChapterId: PropTypes.string.isRequired,
};


export class TableOfContentsBody extends Component {
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  render() {
    const {t, dimensions, selectedDimensionId, selectDimension} = this.props;

    const items = dimensions.map(({id}) => {
      return (
        <DimensionChapterItem
          t={t}
          dimensions={dimensions}
          dimensionId={id}
          isSelected={id === selectedDimensionId}
          selectDimension={selectDimension} />
      );
    }).concat([
      <ExtraChapterItem t={t} extraChapterId='X1' />,
      <ExtraChapterItem t={t} extraChapterId='X2' />,
      <ExtraChapterItem t={t} extraChapterId='X3' />,
    ]);

    return (
      <div className={css(styles.root)}>
        {items.map((el, index) => {
          return <div key={index} className={css(styles.item)}>{el}</div>;
        })}
      </div>
    );
  }
}

TableOfContentsBody.propTypes = {
  t: PropTypes.any.isRequired,
  dimensions: PropTypes.any.isRequired,
  selectedDimensionId: PropTypes.any,
  selectDimension: PropTypes.any.isRequired,
};
