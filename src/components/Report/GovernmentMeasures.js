import React, {PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';
import BlockList from './BlockList';
import {onlyS} from 'theme/mediaQueries';
import {dimensionBackgroundColorAlpha20Style} from 'theme/colors';
import {renderMarkdown, defaultVisitors} from 'components/Markdown/renderMarkdown';
import {Paragraph, Heading} from './ReportPageComponents';
import {text, softGrey, marginL} from 'theme/constants';

const styles = StyleSheet.create({
  outerContainer: {
    marginTop: marginL,
    marginLeft: -20,
    marginRight: -20,
    marginBottom: marginL,
    paddingLeft: 20,
    paddingRight: 20,
    borderBottom: `1px solid ${softGrey}`,
  },
  container: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    color: text,
    padding: '20px 40px 32px',
    width: '100%',
    maxWidth: 610,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 0,
    [onlyS]: {
      padding: '20px 24px 24px',
    }
  },

  lastOuterContainer: {
    borderBottom: 'none',
    marginBottom: 0,
  },
  lastContainer: {
    borderRadius: 8,
  },
});

const governmentMeasuresVisitors = (t) => ({
  ...defaultVisitors(t),
  zone: (node, index, parent, visitChildren) => visitChildren(node),
  list: (node, index) => <BlockList key={index} t={t} content={node} />,
  paragraph: (node, index, parent, visitChildren) => <Paragraph key={index}>{visitChildren(node)}</Paragraph>
});

const GovernmentMeasures = ({t, dimensionId, title, content, isLast}) => (
  <div className={css(styles.outerContainer, isLast && styles.lastOuterContainer)}>
    <div className={css(styles.container, isLast && styles.lastContainer, dimensionBackgroundColorAlpha20Style(dimensionId))}>
      <Heading level={2}>{title}</Heading>
      {renderMarkdown(content, {visitors: governmentMeasuresVisitors(t)})}
    </div>
  </div>
);

GovernmentMeasures.propTypes = {
  t: PropTypes.func.isRequired,
  dimensionId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.object.isRequired,
  isLast: PropTypes.bool.isRequired,
};

export default GovernmentMeasures;
