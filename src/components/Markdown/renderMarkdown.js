import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet, css} from 'aphrodite';

import Link from './Inline/Link';
import Image from './Inline/Image';
import Heading from 'components/Heading/Heading';
import CabinetChart from 'components/Chart/CabinetChart';
import {ChevronRightIcon12} from 'components/Icons/Icons';

const styles = StyleSheet.create({
  externalLinkIcon: {
    display: 'inline-block',
    marginLeft: 4,
  },
});

const MissingMarkdownNodeType = ({node, children}) => (
  <span style={{background: '#FF5555', color: '#FFFFFF', display: 'inline-block', margin: 4}}>
    Missing Markdown node type "{node.type}" ({children})
    {node.name ? `with name "${node.name}"` : ''}
    {node.lang ? `with lang "${node.lang}"` : ''}
  </span>
);
MissingMarkdownNodeType.propTypes = {
  node: PropTypes.object.isRequired,
  children: PropTypes.node
};

export const defaultVisitors = (t) => ({
  root: (node, index, parent, visitChildren) => <div>{visitChildren(node)}</div>,
  heading: (node, index, parent, visitChildren) => <Heading level={node.depth} key={index}>{visitChildren(node)}</Heading>,
  paragraph: (node, index, parent, visitChildren) => {
    return parent.type === 'listItem'
      ? visitChildren(node)
      : <p key={index}>{visitChildren(node)}</p>;
  },
  break: (node, index) => <br key={index} />,
  blockquote: (node, index, parent, visitChildren) => <blockquote key={index}>{visitChildren(node)}</blockquote>,
  strong: (node, index, parent, visitChildren) => <strong key={index}>{visitChildren(node)}</strong>,
  emphasis: (node, index, parent, visitChildren) => <em key={index}>{visitChildren(node)}</em>,
  list: (node, index, parent, visitChildren) => {
    const props = {key: index, start: node.start};
    return node.ordered
      ? <ol {...props}>{visitChildren(node)}</ol>
      : <ul {...props}>{visitChildren(node)}</ul>;
  },
  listItem: (node, index, parent, visitChildren) => <li key={index}>{visitChildren(node)}</li>,
  sub: (node, index) => <sub key={index}>{node.value}</sub>,
  sup: (node, index) => <sup key={index}>{node.value}</sup>,
  text: (node) => node.value,
  // Customized
  link: (node, index, parent, visitChildren) => (
    <Link key={index} href={node.url} title={node.title || undefined} t={t}>
      {visitChildren(node)}

      {false && <span className={css(styles.externalLinkIcon)}>
        <ChevronRightIcon12 color='black' />
      </span>}
    </Link>
  ),
  image: (node, index) => <Image key={index} src={node.url} caption={node.title} alt={node.alt} />,
  code: (node, index) => {
    if (node.lang === 'chart') {
      return <CabinetChart key={index}>{node.value}</CabinetChart>;
    }
    return <MissingMarkdownNodeType key={index} node={node} />;
  },
  // Just display link references as text (e.g. [...])
  linkReference: (node) => `[${node.children[0].value}]`,
  // Fallback
  default: (node, index, parent, visitChildren) => {
    console.warn(`Unhandled Markdown node type: ${node.type}`, node); // eslint-disable-line no-console
    return <MissingMarkdownNodeType key={index} node={node}>{visitChildren(node)}</MissingMarkdownNodeType>;
  }
});

// renderMarkdown(mdast: Mdast, options: {visitors: Object<Visitor>} -> ReactElement
export const renderMarkdown = (mdast, options = {}) => {
  if (typeof mdast === 'string') {
    throw Error('Please provide a valid mdast (https://github.com/wooorm/mdast) and not a string to `renderMarkdown`');
  }

  const visitors = options.visitors;

  let visit;
  let visitChildren;

  visit = (node, index, parent) => {
    let visitor = visitors[node.type] || visitors.default;
    return visitor(node, index, parent, visitChildren);
  };

  visitChildren = (node) => {
    if (!node.children || node.children.length === 0) {
      return null;
    }
    return node.children.length === 1
      ? visit(node.children[0], 0, node)
      : node.children.map((c, i) => visit(c, i, node));
  };

  return visit(mdast, null, null);
};

export default renderMarkdown;
