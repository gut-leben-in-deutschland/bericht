import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet, css} from 'aphrodite';

import {GUTTER, CONTENT_PADDING, Container, Grid, CustomSpan} from 'components/Grid/Grid';
import {minCardWidth, cardDataForIndicators, Card} from 'components/Indicator/Overview/Card';

import {createMediaQuery} from 'theme/mediaQueries';
import {text} from 'theme/constants';
import {BundesSerifRegular} from 'theme/fonts';


// The minimal width of the grid, including the outer container, when we want to
// fit 'numCards' on each row into it. With these calculations (and media
// queries) we ensure that each card (the white box) is actually at least
// 'minCardWidth' wide.
function gridWidth(numCards) {
  return numCards * (minCardWidth + GUTTER) + CONTENT_PADDING;
}

const styles = StyleSheet.create({
  dimensionDescription: {
    paddingBottom: 40
  },
  dimensionTitle: {
    fontFamily: BundesSerifRegular,
    fontSize: 26,
    color: text,
    margin: '12px 0'
  },
  cardSpan: {
    width: '100%',

    [createMediaQuery(gridWidth(2), gridWidth(3))]: {
      width: (100 / 2) + '%'
    },
    [createMediaQuery(gridWidth(3), gridWidth(4))]: {
      width: (100 / 3) + '%'
    },
    [createMediaQuery(gridWidth(4), Infinity)]: {
      width: (100 / 4) + '%'
    },
  }
});

export function ContentAsGrid({t, locale, dimensions, indicators}) {
  return (
    <div className={css(styles.container)}>
      <Container>
        <Grid>
          {cardDataForIndicators(dimensions, indicators).map((card, index) => (
            <CustomSpan key={index} extraStyles={[styles.cardSpan]}>
              <Card card={card} locale={locale} t={t} />
            </CustomSpan>
          ))}
        </Grid>
      </Container>
    </div>
  );
}

ContentAsGrid.propTypes = {
  locale: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  dimensions: PropTypes.array.isRequired,
  indicators: PropTypes.array.isRequired,
};
