import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';

import renderMarkdown, {defaultVisitors} from 'components/Markdown/renderMarkdown';

import {sansRegular14, sansBold14, sansBold16} from 'theme/typeface';
import {midGrey, link} from 'theme/constants';


const styles = StyleSheet.create({
  root: {
    userSelect: 'none'
  },
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,

    cursor: 'pointer'
  },
  header: {
    ...sansBold16,
    color: link,

    marginRight: 'auto'
  },
  list: {
    ...sansRegular14,
    color: midGrey,
    margin: '0 0 16px',
    padding: 0,

    listStyleType: 'none'
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    margin: '8px 0 8px 0',
    userSelect: 'auto',
    position: 'relative',
  },
  jumpTarget: {
    position: 'absolute',
    top: -100,
    visibility: 'hidden'
  },
  listItemNumber: {
    ...sansBold14,
    width: '2em',
    paddingRight: 8,
    textAlign: 'right',
    flexShrink: 0,
  },
  backLink: {
    color: link,
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline'
    }
  },
  listItemContent: {
    flexGrow: 1
  },
  paragraph: {
    ...sansRegular14,
    margin: 0
  }
});

const wrapFootnotesInRoot = (nodes) => ({type: 'footnotesRoot', children: nodes});

const FootnoteDefinitions = (props) => <ol className={css(styles.list)} {...props} />;

const FootnoteDefinition = ({identifier, t, children}) => (
  <li className={css(styles.listItem)}>
    <span className={css(styles.jumpTarget)} id={`fn-${identifier}`}/>
    <div className={css(styles.listItemNumber)}>
      {identifier}
    </div>
    <div className={css(styles.listItemContent)}>
      {children}
      <FootnoteParagraph>
        <a className={css(styles.backLink)} href={`#fn-ref-${identifier}`} aria-label={t('footnotes/back-to-content')} title={t('footnotes/back-to-content')}>↩︎</a>
      </FootnoteParagraph>
    </div>
  </li>
);

FootnoteDefinition.propTypes = {
  identifier: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  children: PropTypes.node
};

const FootnoteParagraph = (props) => (
  <p className={css(styles.paragraph)} {...props} />
);

const footnoteVisitors = (t) => ({
  ...defaultVisitors(t),
  footnotesRoot: (node, index, parent, visitChildren) => <FootnoteDefinitions>{visitChildren(node)}</FootnoteDefinitions>,
  footnoteDefinition: (node, index, parent, visitChildren) => {
    return <FootnoteDefinition key={index} identifier={node.identifier} t={t}>{visitChildren(node)}</FootnoteDefinition>;
  },
  paragraph: (node, index, parent, visitChildren) => {
    return <FootnoteParagraph key={index}>{visitChildren(node)}</FootnoteParagraph>;
  }
});

export class Footnotes extends Component {
  constructor(props) {
    super(props);
    this.state = {isExpanded: false};

    this.toggle = () => {
      this.setState(({isExpanded}) => ({isExpanded: !isExpanded}));
    };
  }

  render() {
    const {footnotes, t} = this.props;

    return (
      <section className={css(styles.root)}>
        <div className={css(styles.headerRow)} onClick={this.toggle}>
          <h1 id='footnote-definitions' className={css(styles.header)}>{t('footnotes/title')}</h1>
        </div>
        {renderMarkdown(wrapFootnotesInRoot(footnotes), {visitors: footnoteVisitors(t)})}
      </section>
    );
  }
}

Footnotes.propTypes = {
  footnotes: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired
};
