/*

# Example

extractMarkdown(ast, {
  extractors: [
    {key: 'descriptions', test: ({type, name}) => type === 'zone' && name === 'description'}
  ]
})

=> {
  content: {...},     <- ast without descriptions
  extracts: {
    descriptions: [
      ...             <- descriptions (collected depth-first)
    ]
  }
}

*/
const defaultExtractors = [
  // type Extractor = {key: String, test(node: Node): Boolean}
  {key: 'footnoteDefinitions', test: (node) => node.type === 'footnoteDefinition'}
];

const visitor = (node, index, parent, visitChildren) => {
  return {
    ...node,
    children: visitChildren(node)
  };
};

const extractMarkdown = (mdast, options = {}) => {
  if (typeof mdast === 'string') {
    throw Error('Please provide a valid mdast (https://github.com/wooorm/mdast) and not a string to `renderMarkdown`');
  }

  const extractors = options.extractors || defaultExtractors;
  const extractorKeys = extractors.map(e => e.key);

  const extracts = extractorKeys.reduce((result, k) => {
    result[k] = [];
    return result;
  }, {});

  const meta = mdast.meta || {};

  let visit;
  let visitChildren;

  visit = (node, index, parent) => {
    let nodeExtracted = false;
    extractors.forEach(({key, test}) => {
      if (test(node, index, parent)) {
        nodeExtracted = true;
        extracts[key].push(node);
      }
    });
    return nodeExtracted ? null : visitor(node, index, parent, visitChildren);
  };

  visitChildren = (node) => {
    if (!node.children) {
      return null;
    }
    return node.children.map((c, i) => visit(c, i, node)).filter(c => c !== null);
  };

  return {
    content: visit(mdast, null, null),
    meta,
    extracts
  };
};

export default extractMarkdown;
