import React from 'react';
import {scaleBand} from 'd3-scale';
import {rgb} from 'd3-color';
import {range} from 'd3-array';
import {Page, ColorPaletteSpecimen, ColorSpecimen, CodeSpecimen} from 'catalog';

import themeConstants from 'theme/constants';
import {allDimensionIds, dimensionColorPalette, dimensionPaletteColor} from 'utils/dimension';

function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function colorToHex(color) {
  const {r, g, b} = rgb(color);
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

const ColorPaletteSvg = () => {
  const width = 1000;
  const height = 1000;
  const x = scaleBand().domain(range(10).map(i => 10 + i * 10)).rangeRound([0, width]);
  const y = scaleBand().domain(allDimensionIds).rangeRound([0, height]).padding(0.2);
  return (
    <svg width={width} height={height}>
      {allDimensionIds.map(d => {
        const palette = dimensionColorPalette(d);

        return (
          <g key={d} transform={`translate(0,${y(d)})`}>
            {
              palette.map(c => (
                <g key={c.value} transform={`translate(${x(c.luminance)},0)`}>
                  <rect fill={c.value} width={x.bandwidth()} height={y.bandwidth()} />
                  <g fill={c.luminance > 50 ? '#000' : '#fff'}>
                    <text dy='50' dx='10'>{colorToHex(c.value)}</text>
                    <text dy='20' dx='10'>{c.primary && c.dimensionId}</text>
                  </g>
                </g>
              ))
            }
          </g>
        );
      })}
    </svg>
  );
};

export default () => (
  <Page>
    <h2>Text</h2>
    <ColorPaletteSpecimen
      horizontal
      colors={[
        {name: 'text', value: themeConstants.text},
        {name: 'link', value: themeConstants.link}
      ]}
    />

    <h2>Backgrounds</h2>
    <ColorPaletteSpecimen
      horizontal
      colors={[
        {name: 'beige', value: themeConstants.beige},
        {name: 'softBeige', value: themeConstants.softBeige}
      ]}
    />

    <h2>Shades of Grey</h2>
    <ColorPaletteSpecimen
      horizontal
      colors={[
        {name: 'black', value: themeConstants.black},
        {name: 'darkGrey', value: themeConstants.darkGrey},
        {name: 'midGrey', value: themeConstants.midGrey},
        {name: 'grey', value: themeConstants.grey},
        {name: 'lightGrey', value: themeConstants.lightGrey},
        {name: 'softGrey', value: themeConstants.softGrey},
        {name: 'white', value: themeConstants.white}
      ]}
    />

    <h2>Dimensions</h2>
    <ColorPaletteSpecimen
      colors={[
        {value: themeConstants.dimension01, name: '01'},
        {value: themeConstants.dimension02, name: '02'},
        {value: themeConstants.dimension03, name: '03'},
        {value: themeConstants.dimension04, name: '04'},
        {value: themeConstants.dimension05, name: '05'},
        {value: themeConstants.dimension06, name: '06'},
        {value: themeConstants.dimension07, name: '07'},
        {value: themeConstants.dimension08, name: '08'},
        {value: themeConstants.dimension09, name: '09'},
        {value: themeConstants.dimension10, name: '10'},
        {value: themeConstants.dimension11, name: '11'},
        {value: themeConstants.dimension12, name: '12'}
      ]}
    />

    <h2>Dimension palettes (perceptual)</h2>

    <CodeSpecimen lang='js'>{`dimensionColorPalette('01') // => [{value: String, luminance: Number, dimensionId: String, primary?: Boolean}]`}</CodeSpecimen>

    {allDimensionIds.map(d => (
      <ColorPaletteSpecimen
        horizontal
        key={d}
        colors={dimensionColorPalette(d).map(({value, luminance, dimensionId, primary}) => ({name: `${primary ? '● ' : ''}${dimensionId}-${luminance}`, value: colorToHex(value)}))} />
    ))}

    <h2>SVG Color Palettes</h2>

    <ColorPaletteSvg />

    <h2>Picking palette colors</h2>

    <ColorSpecimen span={2} name={`Primary palette color`} value={colorToHex(dimensionPaletteColor('03').value)} />
    <CodeSpecimen lang='js'  span={4}>{`dimensionPaletteColor('03').value`}</CodeSpecimen>

    <ColorSpecimen span={2} name={`Palette color with specific luminance`} value={colorToHex(dimensionPaletteColor('03', {luminance: 30}).value)} />
    <CodeSpecimen lang='js'  span={4}>{`dimensionPaletteColor('03', {luminance: 30}).value`}</CodeSpecimen>

    <ColorSpecimen span={2} name={`Palette color with relative luminance (to the primary color)`} value={colorToHex(dimensionPaletteColor('03', {relativeLuminance: 50}).value)} />
    <CodeSpecimen lang='js'  span={4}>{`dimensionPaletteColor('03', {relativeLuminance: 50}).value`}</CodeSpecimen>

  </Page>
);

/*
import theme from 'theme/constants';

export default () => (
  <Page>
  <h2>Primary Colors</h2>
  <ColorSpecimen name={'IXT Blue'} value={theme.colorIXTBlue} span={1} />
  <ColorSpecimen name={'IXT Light Blue'} value={theme.colorIXTLightBlue} span={1} />

  <h2>Secondary Colors</h2>

  <h2>Monochrome Colors</h2>
  <ColorPaletteSpecimen colors={[
    {name: 'colorWhite', value: theme.colorWhite},
    {name: 'colorSnowWhite', value: theme.colorSnowWhite},
    {name: 'colorBrightWhite', value: theme.colorBrightWhite},
    {name: 'colorSmokeWhite', value: theme.colorSmokeWhite},
    {name: 'colorBrightGrey', value: theme.colorBrightGrey},
    {name: 'colorLightGrey', value: theme.colorLightGrey},
    {name: 'colorRegularGrey', value: theme.colorRegularGrey},
    {name: 'colorMidGrey', value: theme.colorMidGrey},
    {name: 'colorDarkGrey', value: theme.colorDarkGrey},
    {name: 'colorBlack', value: theme.colorBlack}
  ]} span={2} />

  </Page>
);
*/
