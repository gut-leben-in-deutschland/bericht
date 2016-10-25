import {ascending} from 'd3-array';
import {dimensionTitle} from 'utils/dimension';
import {indicatorTitle} from 'utils/indicator';


const parseKeywords = keywords => (keywords || '')
  .split(',')
  .map(x => x.trim())
  .filter(Boolean);

export const getOptions = (t, dimensions, indicators, value) => {
  if (value === '') {
    return dimensions.map(({id, keywords}) => ({
      label: dimensionTitle(dimensions, id),
      value: {
        location: t(`route/dimension-${id}`),
        subLabel: t('search-bar/sub-label/dimension'),
        primaryKeyword: dimensionTitle(dimensions, id),
        keywords: parseKeywords(keywords)
      }
    })).sort((a, b) => ascending(a.label, b.label));
  }

  const allUniqueKeywords = []
    .concat(
      ...indicators.map(x => x.keywords).map(parseKeywords),
      ...dimensions.map(x => x.keywords).map(parseKeywords)
    )
    .filter((v, index, self) => !!v && self.indexOf(v) === index);

  const options = [].concat(
    dimensions.map(({id, keywords}) => ({
      label: dimensionTitle(dimensions, id),
      value: {
        location: t(`route/dimension-${id}`),
        subLabel: t('search-bar/sub-label/dimension'),
        primaryKeyword: dimensionTitle(dimensions, id).toLowerCase(),
        keywords: parseKeywords(keywords),
      }
    })),
    indicators.map(({id, keywords}) => ({
      label: indicatorTitle(indicators, id),
      value: {
        location: t(`route/indicator-${id}`),
        subLabel: t('search-bar/sub-label/indicator'),
        primaryKeyword: indicatorTitle(indicators, id).toLowerCase(),
        keywords: parseKeywords(keywords),
      }
    })),
    allUniqueKeywords.map(keyword => ({
      label: keyword,
      value: {
        location: {pathname: t(`route/dashboard`), query: {keyword}},
        subLabel: '',
        primaryKeyword: keyword.toLowerCase(),
        keywords: [],
      }
    }))
  ).sort((a, b) => ascending(a.label, b.label));

  return options;
};

export const filterFactory = value => {
  const searchValue = value.toLowerCase();

  return option => (
    option.value.primaryKeyword.indexOf(searchValue) >= 0 ||
    option.value.keywords.indexOf(searchValue) >= 0
  );
};
