import React, {PropTypes} from 'react';
import {LinkInline as Link} from 'components/ButtonLink/Link';
import {formatLocale, formatSpecifier, precisionFixed} from 'd3-format';

const format = formatLocale({
  decimal: ',',
  thousands: '.',
  grouping: [3],
  currency: ['', '\u00a0€']
}).format;

const decimalFormat = format('.0f');
const formatPow = (t, baseValue) => {
  let [n] = decimalFormat(baseValue).split('.');
  let scale = value => value;
  let suffix = '';
  if (n.length > 9) {
    scale = value => value / Math.pow(10, 9);
    suffix = t('format/pow9/suffix');
  } else if (n.length > 6) {
    scale = value => value / Math.pow(10, 6);
    suffix = t('format/pow6/suffix');
  }
  return {
    scale,
    suffix
  };
};

const sFormat = (t, precision = 4, pow, type = 'r') => {
  const numberFormat = format(',d');
  // we only round suffixed values to precision
  const numberFormatWithSuffix = format(`,.${precision}${type}`);
  return value => {
    let fPow = pow || formatPow(t, value);
    if (fPow.suffix) {
      return numberFormatWithSuffix(fPow.scale(value)) + fPow.suffix;
    }
    return numberFormat(fPow.scale(value));
  };
};

export const getFormat = (numberFormat, t) => {
  const specifier = formatSpecifier(numberFormat);

  if (specifier.type === 's') {
    if (!t) {
      throw new Error('Need to pass a translation function if you use s format');
    }
    return sFormat(t, specifier.precision);
  }
  return format(specifier);
};

export const calculateAxis = (numberFormat, t, domain, unit = '') => {
  const [min, max] = domain;
  const step = (max - min) / 2;
  const ticks = [min, min + step, max];

  const specifier = formatSpecifier(numberFormat);
  let formatter = getFormat(numberFormat, t);
  let regularFormat;
  let lastFormat;
  if (specifier.type === '%') {
    let fullStep = +(step * 100).toFixed(specifier.precision);
    let fullMax = +(max * 100).toFixed(specifier.precision);
    specifier.precision = precisionFixed((fullStep - Math.floor(fullStep)) || (fullMax - Math.floor(fullMax)));
    lastFormat = format(specifier.toString());
    specifier.type = 'f';
    const regularFormatInner = format(specifier.toString());
    regularFormat = (value) => regularFormatInner(value * 100);
  } else if (specifier.type === 's') {
    let pow = formatPow(t, min + step);
    let scaledStep = pow.scale(step);
    let scaledMax = pow.scale(max);
    specifier.precision = precisionFixed((scaledStep - Math.floor(scaledStep)) || (scaledMax - Math.floor(scaledMax)));

    lastFormat = sFormat(t, specifier.precision, pow, 'f');
    regularFormat = sFormat(t, specifier.precision, {scale: pow.scale, suffix: ''}, 'f');
  } else {
    specifier.precision = precisionFixed((step - Math.floor(step)) || (max - Math.floor(max)));
    lastFormat = regularFormat = format(specifier.toString());
  }
  const axisFormat = (value, isLast) => isLast ? `${lastFormat(value)} ${unit}` : regularFormat(value);

  return {
    ticks,
    format: formatter,
    axisFormat
  };
};

export const BKGLegend = ({t, year}) => (
  <span>{t('charts/geo-base')}{' '}© GeoBasis-DE / <Link t={t} href={'https://www.bkg.bund.de/'}>BKG</Link> {year}.</span>
);

BKGLegend.propTypes = {
  t: PropTypes.func.isRequired,
  year: PropTypes.number.isRequired
};

BKGLegend.defaultProps = {
  year: 2016
};
