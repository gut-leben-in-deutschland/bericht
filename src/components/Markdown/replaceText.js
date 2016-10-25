const replace = (node, replacements) => {
  let value = node.value;
  let children;
  if (node.children) {
    children = node.children.map(n => replace(n, replacements));
  }
  if (node.type === 'text' && value) {
    Object.keys(replacements).forEach(key => {
      value = value.replace(`{${key}}`, replacements[key]);
    });
  }
  return {
    ...node,
    children,
    value
  };
};

export default replace;
