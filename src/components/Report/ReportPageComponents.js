import React, {PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';

import {BundesSansBold, BundesSerifRegularItalic} from 'theme/fonts';
import {beige, midGrey, marginL} from 'theme/constants';
import {sansRegular12, sansRegular18, serifRegularIt26} from 'theme/typeface';
import {onlyS} from 'theme/mediaQueries';

import {Grid, Span} from 'components/Grid/Grid';
import {default as DefaultHeading} from 'components/Heading/Heading';
import FootnoteReference from 'components/Footnotes/FootnoteReference';
import {defaultVisitors} from 'components/Markdown/renderMarkdown';


const clearMarginsOnFirstAndLast = {
  ':first-child': {
    marginTop: 0,
  },
  ':last-child': {
    marginBottom: 0
  },
};

const styles = StyleSheet.create({
  contentContainer: {
    width: '100%',
    maxWidth: 610
  },
  reportPageSection: {
    margin: `${marginL}px 0`,
  },
  reportPageRightColumn: {
    [onlyS]: {
      marginTop: marginL,
    },
  },
  paragraph: {
    ...sansRegular18,
    ...clearMarginsOnFirstAndLast,
    margin: `0 0 ${18}px 0`,
  },
  list: {
    ...clearMarginsOnFirstAndLast,
    margin: `0 0 ${18}px 0`,
    padding: `0 0 0 ${18 * 1.5}px`,
  },
  listItem: {
    ...sansRegular18
  },
  blockquote: {
    ...serifRegularIt26,
    ...clearMarginsOnFirstAndLast,
    margin: `${marginL}px auto`,
    textAlign: 'center',
  },
  blockquoteSeparator: {
    width: 40,
    height: 2,
    background: beige,
    margin: '18px auto',
    lineHeight: 0
  },
  blockquoteSource: {
    ...sansRegular12,
    display: 'block',
    color: midGrey,
    margin: 0
  },

  reportPageChart: {
    ...clearMarginsOnFirstAndLast,
    margin: `${marginL}px 0`,
  },
});

// Layout zones

export const ScrollContainerSection = (props) => {
  return <div className={css(styles.reportPageSection)} {...props} />;
};

export const Section = (props) => (
  <div className={css(styles.reportPageSection)}>
    <Grid {...props} />
  </div>
);

export const LeftColumn = (props) => (
  <Span {...props} s={'2/2'} m={'3/6'} />
);

export const RightColumn = ({children, ...props}) => ( // eslint-disable-line
  <Span {...props} s={'2/2'} m={'3/6'}>
    <div className={css(styles.reportPageRightColumn)}>{children}</div>
  </Span>
);


// Text

export const Heading = (props) => (
  <DefaultHeading additionalStyles={styles.contentContainer} {...props} />
);

export const Paragraph = (props) => (
  <p className={css(styles.contentContainer, styles.paragraph)} {...props}/>
);

export const OrderedList = (props) => (
  <ol className={css(styles.contentContainer, styles.list)} {...props}/>
);

export const UnorderedList = (props) => (
  <ul className={css(styles.contentContainer, styles.list)} {...props}/>
);

export const ListItem = (props) => (
  <li className={css(styles.listItem)} {...props}/>
);

export const Blockquote = ({t, text, source}) => (
  <blockquote className={css(styles.contentContainer, styles.blockquote)}>
    <div className={css(styles.blockquoteSeparator)} />
      {t('quotes/opening')}{text}{t('quotes/closing')}
    <div className={css(styles.blockquoteSeparator)} />
    <cite className={css(styles.blockquoteSource)}>{source}</cite>
  </blockquote>
);

Blockquote.propTypes = {
  t: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  source: PropTypes.string.isRequired
};

// Inline elements

const inlineStyles = StyleSheet.create({
  strong: {
    fontFamily: BundesSansBold,
    fontWeight: 'normal'
  },
  emphasis: {
    fontFamily: BundesSerifRegularItalic,
    fontStyle: 'normal',
    fontWeight: 'normal'
  }
});

export const Strong = (props) => (
  <strong className={css(inlineStyles.strong)} {...props}/>
);

export const Emphasis = (props) => (
  <em className={css(inlineStyles.emphasis)} {...props}/>
);

export const ReportPageChart = (props) => {
  return <div className={css(styles.reportPageChart)} {...props} />;
};

export const defaultReportVisitors = (t) => ({
  ...defaultVisitors(t),
  heading: (node, index, parent, visitChildren) => <Heading level={node.depth} key={index}>{visitChildren(node)}</Heading>,
  paragraph: (node, index, parent, visitChildren) => {
    return parent.type === 'listItem'
      ? visitChildren(node)
      : <Paragraph key={index}>{visitChildren(node)}</Paragraph>;
  },
  // blockquote: (node, index, parent, visitChildren) => <Blockquote key={index}>{visitChildren(node)}</Blockquote>,
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
  emphasis: (node, index, parent, visitChildren) => <Emphasis key={index}>{visitChildren(node)}</Emphasis>
});
