/* eslint no-var: 0, vars-on-top: 0 */

const parseMarkdown = require('./parse');

module.exports = function loader(markdown) {
  this.cacheable();
  try {
    const mdast = parseMarkdown(markdown);
    return `module.exports = ${JSON.stringify(mdast)};`;
  } catch (e) {
    this.emitError(e);
    return `module.exports = '';`;
  }
};
