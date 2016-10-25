// Use commonjs, so we can use it in the loader without compilation

const unified = require('unified');
const parseMarkdown = require('remark-parse');
const zone = require('./mdast-zone');
const frontmatter = require('./frontmatter');
const subsup = require('./mdast-subsup');

const parser = unified().use(parseMarkdown).use(frontmatter).use(zone).use(subsup);

const processMarkdown = (markdown) => parser.run(parser.parse(markdown, {footnotes: true}));

module.exports = processMarkdown;
