const jsYaml = require('js-yaml');

const parseFrontmatter = (parent) => {
  if (!parent.children || parent.children.length === 0) {
    return parent;
  }

  const frontMatter = parent.children.filter(c => c.type === 'yaml');

  if (frontMatter.length < 1) {
    return parent;
  }

  // Replace old children, add meta
  parent.children = parent.children.filter(c => c.type !== 'yaml');
  try {
    const meta = jsYaml.safeLoad(frontMatter[0].value);
    parent.meta = meta;
  } catch (e) {
    throw Error(`Couldn't parse YAML frontmatter: ${e.message}`); // eslint-disable-line no-console
  }

  return parent;
};

module.exports = () => parseFrontmatter;
