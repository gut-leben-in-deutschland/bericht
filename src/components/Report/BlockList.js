import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet, css} from 'aphrodite';
import {renderMarkdown, defaultVisitors} from 'components/Markdown/renderMarkdown';
import {FenceLink} from 'components/FencedItemList/FencedItemList';

const styles = StyleSheet.create({
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  listItem: {
    borderBottom: `1px solid rgba(0,0,0,0.1)`,
    ':first-child': {
      borderTop: `1px solid rgba(0,0,0,0.1)`
    }
  }
});

const List = (props) => <ul className={css(styles.list)} {...props} />;
const ListItem = (props) => <li className={css(styles.listItem)} {...props} />;

const blockListVisitors = (t) => ({
  ...defaultVisitors(t),
  list: (node, index, parent, visitChildren) => <List key={index}>{visitChildren(node)}</List>,
  listItem: (node, index, parent, visitChildren) => <ListItem key={index}>{visitChildren(node)}</ListItem>,
  paragraph: (node, index, parent, visitChildren) => visitChildren(node), // pass through children
  link: (node, index) => <FenceLink key={index} t={t} to={node.url}>{node.children[0].value}</FenceLink>
});


const BlockList = ({t, content}) => (
  <div>
    {renderMarkdown(content, {visitors: blockListVisitors(t)})}
  </div>
);

BlockList.propTypes = {
  t: PropTypes.func.isRequired,
  content: PropTypes.object.isRequired
};

export default BlockList;
