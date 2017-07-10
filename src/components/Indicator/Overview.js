import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';

import {NarrowContainer} from 'components/Grid/Grid';
import {OverviewHeader, DimensionHeader} from 'components/Indicator/Header';
import {StickyNavBar} from 'components/Navigation/StickyNavBar';
import {ShareFooterData} from 'components/Share/Share';
import {ContentAsList} from 'components/Indicator/Overview/List';
import {ContentAsGrid} from 'components/Indicator/Overview/Grid';
import {minCardWidth} from 'components/Indicator/Overview/Card';
import {CenteredButtonLink} from 'components/Indicator/Overview/CenteredButtonLink';
import SearchBar from 'components/Indicator/SearchBar';

import {createMediaQuery} from 'theme/mediaQueries';
import {softBeige, midGrey} from 'theme/constants';
import {sansRegular14} from 'theme/typeface';

import {dimensionRecord} from 'utils/dimension';


const styles = StyleSheet.create({
  expand: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    backgroundColor: softBeige,
  },
  contentWithTopPadding: {
    paddingTop: 40,
  },

  searchBarContainer: {
    padding: '40px 0',
  },
  searchBarContainerWithResultCount: {
    padding: '40px 0 0',
  },
  searchBarResultCount: {
    ...sansRegular14,
    color: midGrey,

    textAlign: 'center',
    padding: '20px 0',
  },

  asList: {
    display: 'none',
    [createMediaQuery(0, 2 * minCardWidth - 1)]: {
      display: 'block'
    }
  },
  asGrid: {
    display: 'none',
    [createMediaQuery(2 * minCardWidth, Infinity)]: {
      display: 'block'
    }
  },
  shareFooter: {
  }
});


// Everything between the Header and the Footer. That is: the search bar and
// the grid.
//
// This is a stateful component which manages the search string.

function filterFn(filter) {
  if (filter.type === 'dimension') {
    return x => x.dimension_id === filter.dimensionId;
  }

  if (filter.type === 'keyword') {
    return (indicator, dimension) => {
      return (indicator.keywords !== undefined &&
              indicator.keywords.indexOf(filter.keyword) >= 0)
          || (dimension.keywords !== undefined &&
              dimension.keywords.indexOf(filter.keyword) >= 0);
    };
  }

  throw new Error(`IndicatorOverview/filterFn: unknown filter type: ${filter.type}`);
}

function header(dimensions, filter) {
  if (filter === undefined || filter.type === 'keyword') {
    return <OverviewHeader />;
  }

  if (filter.type === 'dimension') {
    return <DimensionHeader dimensions={dimensions} dimensionId={filter.dimensionId} />;
  }

  throw new Error(`IndicatorOverview/header: unknown filter type: ${filter.type}`);
}

export class IndicatorOverview extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {route, dimensions, indicators, filter, cabinet: {t, locale}} = this.props;

    const filteredIndicators = filter === undefined
      ? indicators
      : (function _() {
        const f = filterFn(filter);
        return indicators.filter(x =>
          f(x, dimensionRecord(dimensions, x.dimension_id)));
      })();

    // We're not showing the search bar if filter.type === 'dimension'
    const showSearchBar = filter === undefined || filter.type === 'keyword';

    // If we filter by keyword, show how many indicators matched.
    const showResultCount = filter !== undefined && filter.type === 'keyword';

    const count = filteredIndicators.length;

    return (
      <div className={css(styles.expand)}>
        {filter !== undefined &&
        <StickyNavBar to={t(`route/dashboard`)} label={t('header/dashboard')} />
        }

        <NarrowContainer>
          {header(dimensions, filter)}
        </NarrowContainer>

        <div className={css(styles.expand, styles.content, !showSearchBar && styles.contentWithTopPadding)}>
          {showSearchBar &&
          <div className={css(styles.searchBarContainer, showResultCount && styles.searchBarContainerWithResultCount)}>
            <NarrowContainer>
              <SearchBar locale={locale} t={t} dimensions={dimensions} indicators={indicators}
                value={(filter !== undefined && filter.type === 'keyword') ? filter.keyword : undefined} />

              {showResultCount &&
              <div className={css(styles.searchBarResultCount)}>
                {count === 1 ? t('search-bar/result-count/singular') : t('search-bar/result-count/plural', {count})}
              </div>
              }
            </NarrowContainer>
          </div>
          }

          <div className={css(styles.expand)}>
            <div className={css(styles.asList)}>
              <ContentAsList locale={locale} t={t} dimensions={dimensions} indicators={filteredIndicators} filter={filter} />
            </div>
            <div className={css(styles.asGrid)}>
              <ContentAsGrid locale={locale} t={t} dimensions={dimensions} indicators={filteredIndicators} />
            </div>

            {filter !== undefined &&
              <CenteredButtonLink t={t} to={t('route/dashboard')} label={t('dashboard/show-all-dimensions')} />
            }
          </div>

          <div className={css(styles.shareFooter)}>
            <ShareFooterData route={route} />
          </div>
        </div>
      </div>
    );
  }
}

IndicatorOverview.propTypes = {
  route: PropTypes.object.isRequired,
  cabinet: PropTypes.object.isRequired,
  dimensions: PropTypes.array.isRequired,
  indicators: PropTypes.array.isRequired,

  // Defines if and how the cards should be filtered. And also the initial
  // contents of the search bar.
  filter: PropTypes.oneOfType([
    PropTypes.shape({
      type: PropTypes.oneOf(['dimension']).isRequired,
      dimensionId: PropTypes.string.isRequired,
    }),
    PropTypes.shape({
      type: PropTypes.oneOf(['keyword']).isRequired,
      keyword: PropTypes.string.isRequired,
    }),
  ]),
};
