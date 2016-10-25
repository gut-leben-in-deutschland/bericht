import {rgb, hcl} from 'd3-color';
import {scaleQuantize} from 'd3-scale';
import {range} from 'd3-array';

import * as C from 'theme/constants';

import {highlight} from 'utils/highlight';
import dimensionSchemesIndex from 'theme/dimensionSchemes.json';

export const allDimensionIds = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'
];

export function dimensionColor(dimensionId) {
  return C[`dimension${dimensionId}`];
}

export function dimensionColorAlpha(dimensionId, alpha = 1) {
  const {r, g, b} = rgb(C[`dimension${dimensionId}`]);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function dimensionTextColor(dimensionId) {
  return C[`dimension${dimensionId}Text`];
}

export function dimensionRecord(dimensions, dimensionId) {
  return dimensions.find(x => x.id === dimensionId);
}

function dimensionIndex(dimensions, dimensionId) {
  return dimensions.indexOf(dimensionRecord(dimensions, dimensionId));
}

export function dimensionGroup(dimensions, dimensionId) {
  const mbRecord = dimensionRecord(dimensions, dimensionId);
  return mbRecord !== undefined ? mbRecord.group : undefined;
}

export function dimensionTitle(dimensions, dimensionId) {
  const mbRecord = dimensionRecord(dimensions, dimensionId);
  // ASSERT mbRecord !== undefined

  return mbRecord.title.replace(/\*\*/g, '');
}

export function dimensionTitleWithHighlights(dimensions, dimensionId, className) {
  const mbRecord = dimensionRecord(dimensions, dimensionId);
  // ASSERT mbRecord !== undefined

  return highlight(mbRecord.title, /\*\*([^\*]+)\*\*/, className);
}

export function dimensionGroupTitle(dimensions, dimensionGroupId) {
  function go(dimensionId) {
    const mbRecord = dimensionRecord(dimensions, dimensionId);
    return mbRecord !== undefined ? mbRecord.group : undefined;
  }

  switch (dimensionGroupId) {
  case '1': return go('01');
  case '2': return go('06');
  case '3': return go('09');
  default: return undefined;
  }
}

export function keyFact(dimensions, dimensionId) {
  const mbRecord = dimensionRecord(dimensions, dimensionId);
  if (mbRecord === undefined) {
    return undefined;
  }

  return {
    keyFactValue: mbRecord.key_fact_value,
    keyFactUnit: mbRecord.key_fact_unit,
    keyFactText: mbRecord.key_fact_text,
  };
}

export function prevDimension(dimensions, dimensionId) {
  const index = dimensionIndex(dimensions, dimensionId);
  return dimensions[index - 1];
}

export function nextDimension(dimensions, dimensionId) {
  const index = dimensionIndex(dimensions, dimensionId);
  return dimensions[index + 1];
}


/* COLOR PALETTES*/

// 31.45 -> 30
const luminanceScale = scaleQuantize()
  .domain([0, 100])
  .range([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);

// [10..100]
const luminanceRange = range(10).map(i => 10 + i * 10);

// {[dimensionId]: {[luminance]: {dimensionId, value, luminance, primary?}}}
const dimensionColorPalettes = allDimensionIds.reduce((palettes, dimensionId) => {
  const dimensionColorHcl = hcl(dimensionColor(dimensionId));

  palettes[dimensionId] = luminanceRange.reduce((palette, l) => {
    const primary = l === luminanceScale(dimensionColorHcl.l);
    if (primary) {
      palette[l] = {dimensionId, value: dimensionColorHcl.toString(), luminance: l, primary: true};
      palette.primary = palette[l];
    } else {
      palette[l] = {dimensionId, value: hcl(dimensionColorHcl.h, dimensionColorHcl.c, l).toString(), luminance: l};
    }
    return palette;
  }, {});

  return palettes;
}, {});

export function dimensionColorPalette(dimensionId) {
  const palette = dimensionColorPalettes[dimensionId];
  return Object.keys(palette).filter(k => k !== 'primary').map(k => palette[k]);
}

export function dimensionPaletteColor(dimensionId, options = {relativeLuminance: 0}) {
  const palette = dimensionColorPalettes[dimensionId];

  const luminance = options.luminance
    ? luminanceScale(options.luminance)
    : luminanceScale(palette.primary.luminance + options.relativeLuminance);

  return palette[luminance];
}

export const dimensionSchemes = dimensionId => {
  const scheme = dimensionSchemesIndex[dimensionId];

  if (__DEV__) {
    if (!scheme) {
      console.warn(`no dimension color scheme available for ${dimensionId}, returning 01`); // eslint-disable-line no-console
    }
  }
  return scheme || dimensionSchemesIndex['01'];
};
