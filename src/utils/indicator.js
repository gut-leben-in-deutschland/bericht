import {hyphenate} from 'utils/hyphenate';

function indicatorRecord(indicators, indicatorId) {
  return indicators.find(x => x.id === indicatorId);
}

function indicatorIndex(indicators, indicatorId) {
  return indicators.indexOf(indicatorRecord(indicators, indicatorId));
}

export function dimensionIdFromIndicatorId(indicators, indicatorId) {
  const mbRecord = indicatorRecord(indicators, indicatorId);
  return mbRecord !== undefined ? mbRecord.dimension_id : undefined;
}

export function indicatorTitle(indicators, indicatorId) {
  const mbRecord = indicatorRecord(indicators, indicatorId);
  return mbRecord !== undefined ? mbRecord.title : undefined;
}

export function hyphenatedIndicatorTitle(locale, indicators, indicatorId) {
  return hyphenate(locale, indicatorTitle(indicators, indicatorId));
}


// -----------------------------------------------------------------------------
// {prev,next}IndicatorWithDetail returns the previous or next indicator
// relative to the one given by 'indicatorId' which has a detail page.

export function prevIndicatorWithDetail(indicators, indicatorId) {
  const index = indicatorIndex(indicators, indicatorId);

  return indicators
    .slice(0, index)
    .reverse()[0];
}

export function nextIndicatorWithDetail(indicators, indicatorId) {
  const index = indicatorIndex(indicators, indicatorId);

  return indicators
    .slice(index + 1)[0];
}
