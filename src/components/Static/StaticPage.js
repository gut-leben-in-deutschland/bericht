import React, {Component, PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';

import {NarrowContainer} from 'components/Grid/Grid';
import {Footnotes} from 'components/Footnotes/Footnotes';
import FootnoteReference from 'components/Footnotes/FootnoteReference';
import {renderMarkdown, defaultVisitors} from 'components/Markdown/renderMarkdown';
import {FencedItemList, FenceLink} from 'components/FencedItemList/FencedItemList';
import {Paragraph, OrderedList, UnorderedList, ListItem, Heading, Blockquote, Strong, Emphasis} from 'components/Report/ReportPageComponents';

import {softGrey, softBeige} from 'theme/constants';

import {renderToExternalFenceLinks} from 'utils/external-links';


const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: softBeige,
    paddingTop: 40,
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  footnotesOuterContainer: {
    marginBottom: 32
  },
  footnotesInnerContainer: {
    borderTop: `1px solid ${softGrey}`,
    borderBottom: `1px solid ${softGrey}`
  },
  footer: {
    paddingTop: 48,
  },

  linkListContainer: {
    paddingBottom: 32,
  },

  downloadBlock: {
    margin: '40px 0',
  },
  linkBlock: {
    margin: '40px 0',
  },
});


function visitMdastNode(visitors, node, index, parent) {
  const visitor = visitors[node.type] || visitors.default;
  return visitor(node, index, parent, child =>
    visitMdastChildren(visitors, child)); // eslint-disable-line
}

function visitMdastChildren(visitors, node) {
  if (!node.children || node.children.length === 0) {
    return null;
  }

  return node.children.map((c, i) => visitMdastNode(visitors, c, i, node));
}


function downloadBlockVisitors(t) {
  return {
    ...defaultVisitors(t),
    list: (node, index, parent, visitChildren) => {
      return visitChildren(node);
    },
    listItem: (node, index, parent, visitChildren) => {
      return visitChildren(node)[0];
    },
    paragraph: (node, index, parent, visitChildren) => {
      return visitChildren(node)[0];
    },
    link: (node) => {
      return <FenceLink t={t} title={node.title || undefined} to={node.url} icon='download'>{node.children[0].value}</FenceLink>;
    },
  };
}

function linkBlockVisitors(t) {
  return {
    ...defaultVisitors(t),
    list: (node, index, parent, visitChildren) => {
      return visitChildren(node);
    },
    listItem: (node, index, parent, visitChildren) => {
      return visitChildren(node)[0];
    },
    paragraph: (node, index, parent, visitChildren) => {
      return visitChildren(node)[0];
    },
    link: (node) => {
      return <FenceLink t={t} to={node.url}>{node.children[0].value}</FenceLink>;
    },
  };
}

function markdownVisitors(t) {
  return {
    ...defaultVisitors(t),
    root: (node, index, parent, visitChildren) => <NarrowContainer>{visitChildren(node)}</NarrowContainer>,
    heading: (node, index, parent, visitChildren) => <Heading level={node.depth} key={index}>{visitChildren(node)}</Heading>,
    paragraph: (node, index, parent, visitChildren) => {
      return parent.type === 'listItem'
        ? visitChildren(node)
        : <Paragraph key={index}>{visitChildren(node)}</Paragraph>;
    },
    list: (node, index, parent, visitChildren) => {
      const props = {key: index, start: node.start};
      return node.ordered
        ? <OrderedList {...props}>{visitChildren(node)}</OrderedList>
        : <UnorderedList {...props}>{visitChildren(node)}</UnorderedList>;
    },
    listItem: (node, index, parent, visitChildren) => <ListItem key={index}>{visitChildren(node)}</ListItem>,
    footnoteReference: (node, index) => <FootnoteReference key={index} identifier={node.identifier} />,
    // Inline
    strong: (node, index, parent, visitChildren) => <Strong key={index}>{visitChildren(node)}</Strong>,
    emphasis: (node, index, parent, visitChildren) => <Emphasis key={index}>{visitChildren(node)}</Emphasis>,
    marker: (node, index) => {
      switch (node.name) {
      case 'Quote':
        return <Blockquote key={index} {...node.parameters} t={t} />;
      case 'Iframe':
        return <iframe key={index} style={{border: 0, height: 200, width: '100%'}} {...node.parameters} />;
      default:
        return null;
      }
    },
    zone: (node, index) => {
      switch (node.name) {
      case 'DownloadBlock':
        return (
          <div key={index} className={css(styles.downloadBlock)}>
            <FencedItemList items={visitMdastChildren(downloadBlockVisitors(t), node)[0]} />
          </div>
        );
      case 'LinkBlock':
        return (
          <div key={index} className={css(styles.linkBlock)}>
            <FencedItemList items={visitMdastChildren(linkBlockVisitors(t), node)[0]} />
          </div>
        );
      default:
        return null;
      }
    },
  };
}

class StaticPage extends Component {
  render() {
    const {t, content, footnotes, externalLinks} = this.props;

    const fencedItems = [].concat(
      [ footnotes.length > 0 ? <Footnotes footnotes={footnotes} t={t} /> : undefined, ],
      renderToExternalFenceLinks(t, externalLinks)
    ).filter(x => x !== undefined);

    return (
      <div className={css(styles.root)}>
        <div className={css(styles.content)}>
          {renderMarkdown(content, {visitors: markdownVisitors(t)})}
        </div>

        <div className={css(styles.footer)}>
          {fencedItems.length > 0 &&
          <div className={css(styles.linkListContainer)}>
            <NarrowContainer>
              <FencedItemList items={fencedItems} />
            </NarrowContainer>
          </div>}
        </div>
      </div>
    );
  }
}

StaticPage.propTypes = {
  t: PropTypes.func.isRequired,
  content: PropTypes.object.isRequired,
  footnotes: PropTypes.array.isRequired,
  externalLinks: PropTypes.array.isRequired, // ExternalLink[]
};

export default StaticPage;
