import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet, css} from 'aphrodite';
import {Link} from 'react-router';

import {Container} from 'components/Grid/Grid';
import {cardDataForIndicators, Card} from 'components/Indicator/Overview/Card';

import {text, midGrey, softGrey, softBeige} from 'theme/constants';
import {sansRegular14, sansBold18, serifRegular26} from 'theme/typeface';
import {dimensionBackgroundColorStyle} from 'theme/colors';

import {allDimensionIds, dimensionTitle} from 'utils/dimension';


const styles = StyleSheet.create({
  root: {
    padding: '12px 0',
    backgroundColor: softBeige,
    margin: 0
  },
  li: {
    margin: '0 0 0 20px',
    listStyle: 'none',
    borderBottom: `1px solid ${softGrey}`,
    ':last-child': {
      border: 'none'
    }
  },
  cards: {
    padding: '24px 0 0',
    backgroundColor: softBeige
  },
  asListItem: {
    padding: '14px 16px',
    position: 'relative',

    display: 'block',
    textDecoration: 'none',
  },
  asListColor: {
    position: 'absolute',
    width: 4,
    height: 28,
    top: '50%',
    left: 0,
    marginTop: -14,
    backgroundColor: 'magenta',
    borderRadius: 2
  },
  asListTitle: {
    ...sansBold18,
    color: text
  },
  asListNumIndicators: {
    ...sansRegular14,
    color: midGrey
  },

  dimensionTitle: {
    ...serifRegular26,
    color: text,
    margin: '12px 0'
  },

  backLinkOuter: {
    borderBottom: `1px solid ${softGrey}`,
    display: 'block',
    textDecoration: 'none'
  },
  backLinkInner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 48
  },
  backLinkLabel: {
    ...sansRegular14,
    margin: 'auto',
    color: midGrey
  }
});


export function ContentAsList({locale, t, dimensions, indicators, filter}) {
  if (filter === undefined) {
    return (
      <ul className={css(styles.root)}>
        {allDimensionIds.map(id => {
          const numIndicators = indicators
            .filter(({dimension_id}) => id === dimension_id)
            .length;

          return (
            <li className={css(styles.li)} key={id}>
              <Link className={css(styles.asListItem)} to={t(`route/dimension-${id}`)}>
                <div className={css(styles.asListColor, dimensionBackgroundColorStyle(id))} />
                <div className={css(styles.asListTextBlock)}>
                  <div className={css(styles.asListTitle)}>{dimensionTitle(dimensions, id)}</div>
                  <div className={css(styles.asListNumIndicators)}>{numIndicators} {t('dashboard/cards/n-indicators')}</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className={css(styles.cards)}>
      <Container>
        {cardDataForIndicators(dimensions, indicators).map((card, index) =>
          <Card key={index} card={card} locale={locale} t={t} />)}
      </Container>
    </div>
  );
}

ContentAsList.propTypes = {
  locale: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  dimensions: PropTypes.array.isRequired,
  indicators: PropTypes.array.isRequired,
  filter: PropTypes.object,
};
