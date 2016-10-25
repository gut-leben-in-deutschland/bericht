import React, {Component, PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';

import {NarrowContainer} from 'components/Grid/Grid';

import {serifRegular18, serifRegular24, serifBold18} from 'theme/typeface';
import {text, softBeige} from 'theme/constants';
import {dimensionTextColorStyle, dimensionBackgroundColorStyle} from 'theme/colors';

import {shallowEqual} from 'utils/shallowEqual';
import {dimensionTitleWithHighlights, dimensionGroupTitle} from 'utils/dimension';


const cardHeight = 72;
const cardBorderRadius = 4;


const styles = StyleSheet.create({
  root: {
    backgroundColor: softBeige,
    position: 'relative',
    padding: '12px 0 24px',
    marginBottom: 40,
  },

  groupHeader: {
    ...serifRegular24,
    color: text,
    margin: '0 0 12px',
    padding: '28px 20px 8px',
    backgroundColor: softBeige,
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
  },

  dimensionTitleHighlight: {
    ...serifBold18,
  },

  card: {
    ...serifRegular18,
    position: 'relative',
    borderRadius: cardBorderRadius,
    height: cardHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 4px',
    padding: '0 20px',
    textAlign: 'center',
    boxShadow: '0px 0px 12px 0px rgba(0,0,0,0.4)',
    cursor: 'pointer',
  },
  cardTitle: {
    whiteSpace: 'pre-wrap',
  },
  cardFooter: {
    position: 'absolute',
    top: (cardHeight - cardBorderRadius),
    left: 0,
    right: 0,
    height: cardBorderRadius * 2,
  },
});

export class CardList extends Component {
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  render() {
    const {dimensions, selectDimension} = this.props;

    return (
      <div className={css(styles.root)}>
        <h2 className={css(styles.groupHeader)}>
          <NarrowContainer>
            {dimensionGroupTitle(dimensions, '1')}
          </NarrowContainer>
        </h2>

        <NarrowContainer>
          <Card dimensions={dimensions} dimensionId='01' selectDimension={selectDimension} />
          <Card dimensions={dimensions} dimensionId='02' selectDimension={selectDimension} />
          <Card dimensions={dimensions} dimensionId='03' selectDimension={selectDimension} />
          <Card dimensions={dimensions} dimensionId='04' selectDimension={selectDimension} />
          <Card dimensions={dimensions} dimensionId='05' selectDimension={selectDimension} />
        </NarrowContainer>

        <h2 className={css(styles.groupHeader)}>
          <NarrowContainer>
            {dimensionGroupTitle(dimensions, '2')}
          </NarrowContainer>
        </h2>

        <NarrowContainer>
          <Card dimensions={dimensions} dimensionId='06' selectDimension={selectDimension} />
          <Card dimensions={dimensions} dimensionId='07' selectDimension={selectDimension} />
          <Card dimensions={dimensions} dimensionId='08' selectDimension={selectDimension} />
        </NarrowContainer>

        <h2 className={css(styles.groupHeader)}>
          <NarrowContainer>
            {dimensionGroupTitle(dimensions, '3')}
          </NarrowContainer>
        </h2>

        <NarrowContainer>
          <Card dimensions={dimensions} dimensionId='09' selectDimension={selectDimension} />
          <Card dimensions={dimensions} dimensionId='10' selectDimension={selectDimension} />
          <Card dimensions={dimensions} dimensionId='11' selectDimension={selectDimension} />
          <Card dimensions={dimensions} dimensionId='12' selectDimension={selectDimension} />
        </NarrowContainer>
      </div>
    );
  }
}

CardList.propTypes = {
  dimensions: PropTypes.array.isRequired,
  selectDimension: PropTypes.func.isRequired,
};


function Card({dimensions, dimensionId, selectDimension}) {
  return (
    <div className={css(styles.card, dimensionTextColorStyle(dimensionId), dimensionBackgroundColorStyle(dimensionId))}
      onClick={() => { selectDimension(dimensionId); }}>
      <div className={css(styles.cardFooter, dimensionBackgroundColorStyle(dimensionId))} />
      <div className={css(styles.cardTitle)}>
        {dimensionTitleWithHighlights(dimensions, dimensionId, css(styles.dimensionTitleHighlight))}
      </div>
    </div>
  );
}

Card.propTypes = {
  dimensions: PropTypes.array.isRequired,
  dimensionId: PropTypes.any.isRequired,
  selectDimension: PropTypes.func.isRequired,
};
