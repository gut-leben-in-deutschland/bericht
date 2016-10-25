import {PropTypes} from 'react';

import {withCabinet} from 'cabinet';
import renderMarkdown, {defaultVisitors} from './renderMarkdown';
import extractMarkdown from './extractMarkdown';

const Markdown = ({cabinet: {t}, mdast}) => {
  return renderMarkdown(extractMarkdown(mdast).content, {visitors: defaultVisitors(t)});
};

Markdown.propTypes = {
  mdast: PropTypes.shape({type: PropTypes.oneOf(['root']), children: PropTypes.array}).isRequired
};

const selectMarkdown = ({src}) => {
  return {
    mdast: src
  };
};

const ContentMarkdown = withCabinet(
  selectMarkdown
)(Markdown);

export default ContentMarkdown;
