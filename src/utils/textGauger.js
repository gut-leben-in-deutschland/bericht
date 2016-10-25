import memoize from 'lodash/memoize';

const measurementDiv = memoize(() => {
  const div = document.createElement('div');
  div.className = 'DOMMEASUREMENTOUTLET';
  div.style.position = 'fixed';
  div.style.top = '-100%';
  div.style.visibility = 'hidden';
  div.style.pointerEvents = 'none';
  document.body.appendChild(div);
  return div;
}, () => '');

export const createTextGauger = memoize(
  ({fontFamily: {fontFamily}, fontSize, lineHeight}, {dimension, html}) => {
    if (typeof document === 'undefined') {
      return () => {
        throw new Error(`Can't use text gauger in server rendering. ${fontFamily} ${fontSize} ${dimension}`);
      };
    }
    const element = document.createElement('span');
    element.style.fontFamily = fontFamily;
    element.style.fontSize = fontSize;
    element.style.lineHeight = lineHeight;
    measurementDiv().appendChild(element);
    if (html) {
      return memoize(text => {
        element.innerHTML = text;
        return element.getBoundingClientRect()[dimension];
      });
    }
    return memoize(text => {
      element.textContent = text;
      return element.getBoundingClientRect()[dimension];
    });
  },
  ({fontFamily: {fontFamily}, fontSize, lineHeight}, {dimension, html}) =>
    [fontFamily, fontSize, lineHeight, dimension, html].join()
);
