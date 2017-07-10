import {createElement} from 'react';

const splitter = (createTag) => {
  return input => {
    if (!input) {
      return input;
    }
    return input.split(/(<sub>|<sup>)([^<]+)<\/su[bp]>/g).reduce(
      (elements, text, i) => {
        if (text === '<sub>' || text === '<sup>') {
          elements.nextElement = text.replace('<', '').replace('>', '');
        } else {
          if (elements.nextElement) {
            elements.push(createTag(elements.nextElement, elements.nextElement + i, text));
            elements.nextElement = null;
          } else {
            elements.push(text);
          }
        }
        return elements;
      },
      []
    );
  };
};

const svg = splitter((tag, key, text) => {
  return createElement('tspan', {
    key,
    fontSize: '75%',
    dy: tag === 'sub' ? '0.25em' : '-0.5em'
  }, text);
});

const html = splitter((tag, key, text) => createElement(tag, {key}, text));
html.svg = svg;

export default html;
