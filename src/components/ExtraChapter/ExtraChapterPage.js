import React, {Component, PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';

import {GUTTER, NarrowContainer, Grid, Span} from 'components/Grid/Grid';
import {ShareFooterReport} from 'components/Share/Share';
import {Footnotes} from 'components/Footnotes/Footnotes';
import FootnoteReference from 'components/Footnotes/FootnoteReference';
import {renderMarkdown, defaultVisitors} from 'components/Markdown/renderMarkdown';
import {BottomNavBar} from 'components/Navigation/BottomNavBar';
import {FencedItemList} from 'components/FencedItemList/FencedItemList';
import {Paragraph, OrderedList, UnorderedList, ListItem, Heading, Blockquote, Strong, Emphasis} from 'components/Report/ReportPageComponents';
import ChapterMenu from 'components/ChapterMenu/Menu';
import ChapterMenuBarContainer from 'components/ChapterMenu/BarContainer';
import {ChevronLeftIcon18, ChevronRightIcon18} from 'components/Icons/Icons';
import ArrowReplay from 'components/Icons/ArrowReplay.icon.svg';
import {WordCloud} from 'components/WordCloud/WordCloud';

import {text, softGrey, softBeige, marginL} from 'theme/constants';
import {m as mUp, l as lUp, createMediaQuery, breakpointM} from 'theme/mediaQueries';

import {dimensionTitle} from 'utils/dimension';
import {allExtraChapterIds, extraChapterTitleTranslationKey} from 'utils/extra-chapter';
import {renderToExternalFenceLinks} from 'utils/external-links';


const styles = StyleSheet.create({
  expand: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: softBeige,
    paddingTop: 40,
  },
  h1: {
    marginBottom: 24,
    [mUp]: {
      marginBottom: 32,
    },
    [lUp]: {
      marginBottom: 48,
    },
  },
  footnotesOuterContainer: {
    marginBottom: 32
  },
  footnotesInnerContainer: {
    borderTop: `1px solid ${softGrey}`,
    borderBottom: `1px solid ${softGrey}`
  },

  footer: {
    marginTop: marginL,
  },
  linkListContainer: {
    padding: `${48}px 0`,
  },

  mosaic: {
    [createMediaQuery(breakpointM[1], Infinity)]: {
      margin: `0 -${(1400 - 1024) / 2}px`,
    },
  },

  mosaicContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: -GUTTER,
  },
  mosaicSpan: {
    marginLeft: GUTTER,
    width: '100%',

    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'space-between',

    [mUp]: {
      width: 'calc(50% - 20px)',
    }
  },
});

function bottomBarPrev(t, dimensions, extraChapterId) {
  const index = allExtraChapterIds.indexOf(extraChapterId);
  // ASSERT index >= 0

  if (index === 0) {
    return {
      subTitle: `${t('bottom-nav-bar/dimension')} 12`,
      title: dimensionTitle(dimensions, '12'),
      to: t(`route/report-12`),
      icon: <ChevronLeftIcon18 color={text} />,
    };
  }

  const prevExtraChapterId = allExtraChapterIds[index - 1];

  return {
    subTitle: t('bottom-nav-bar/extra-chapter'),
    title: t(extraChapterTitleTranslationKey(prevExtraChapterId)),
    to: t(`route/extra-chapter-${prevExtraChapterId}`),
    icon: <ChevronLeftIcon18 color={text} />,
  };
}

function bottomBarNext(t, dimensions, extraChapterId) {
  const index = allExtraChapterIds.indexOf(extraChapterId);

  if (index === allExtraChapterIds.length - 1) {
    return {
      subTitle: t('title'),
      title: t('bottom-nav-bar/back-to-overview'),
      to: t('route/index'),
      icon: <ArrowReplay />,
    };
  }

  const nextExtraChapterId = allExtraChapterIds[index + 1];

  return {
    subTitle: t('bottom-nav-bar/extra-chapter'),
    title: t(extraChapterTitleTranslationKey(nextExtraChapterId)),
    to: t(`route/extra-chapter-${nextExtraChapterId}`),
    icon: <ChevronRightIcon18 color={text} />,
  };
}

const overrideKey = (element, key) => React.isValidElement(element)
  ? React.cloneElement(element, {key})
  : element;

function markdownVisitors(locale, t) {
  return {
    ...defaultVisitors(t),
    root: (node, index, parent, visitChildren) => <NarrowContainer>{visitChildren(node)}</NarrowContainer>,
    heading: (node, index, parent, visitChildren) => <Heading level={node.depth} key={index}>{visitChildren(node)}</Heading>,
    paragraph: (node, index, parent, visitChildren) => {
      const children = visitChildren(node);

      if (parent.type === 'listItem' || (parent.type === 'zone' && parent.name.match(/^Mosaic/))) {
        return overrideKey(children, index);
      }

      return <Paragraph key={index}>{children}</Paragraph>;
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
      case 'WordCloud':
        return <WordCloud key={index} locale={locale} wordsFile={'X2/wordcloud.csv'} />;
      default:
        return null;
      }
    },
    zone: (node, index, parent, visitChildren) => {
      switch (node.name) {
      case 'MosaicGrid':
        return <Grid key={index}>{visitChildren(node)}</Grid>;
      case 'MosaicColumnLeft':
        return <Span key={index} s='2/2' m='3/6'>{visitChildren(node)}</Span>;
      case 'MosaicColumnRight':
        return <Span key={index} s='2/2' m='3/6'>{visitChildren(node)}</Span>;
      case 'Mosaic':
        return (
          <div key={index} className={css(styles.mosaic)}>
            {visitChildren(node)}
          </div>
        );
      default:
        return null;
      }
    }
  };
}

class ExtraChapterPage extends Component {
  constructor(props) {
    super(props);

    this.state = {showChapterMenu: false};

    this.openChapterMenu = () => { this.setState({showChapterMenu: true}); };
    this.closeChapterMenu = () => { this.setState({showChapterMenu: false}); };
    this.toggleChapterMenu = () => {
      this.setState(previousState => ({
        ...previousState,
        showChapterMenu: !previousState.showChapterMenu
      }));
    };
  }

  render() {
    const {route, locale, t, dimensions, extraChapterId, content, footnotes, externalLinks} = this.props;
    const {showChapterMenu} = this.state;

    const fencedItems = [].concat(
      [ footnotes.length > 0 ? <Footnotes footnotes={footnotes} t={t} /> : undefined, ],
      renderToExternalFenceLinks(t, externalLinks)
    ).filter(x => x !== undefined);

    return (
      <div className={css(styles.expand)}>
        {showChapterMenu && <ChapterMenu
          t={t}
          dimensions={dimensions}
          chapterId={extraChapterId}
          close={this.closeChapterMenu}
          />}

        <ChapterMenuBarContainer
          t={t}
          dimensions={dimensions}
          chapterId={extraChapterId}
          isOpen={showChapterMenu}
          onClick={this.toggleChapterMenu} />

        <div className={css(styles.content)}>
          <NarrowContainer>
            <Heading level={1} additionalStyles={styles.h1}>{t(extraChapterTitleTranslationKey(extraChapterId))}</Heading>
          </NarrowContainer>

          <div className={css(styles.expand)}>
            {renderMarkdown(content, {visitors: markdownVisitors(locale, t)})}
          </div>

          <div className={css(styles.footer)}>
            {fencedItems.length > 0 &&
            <div className={css(styles.linkListContainer)}>
              <NarrowContainer>
                 <FencedItemList items={fencedItems} />
              </NarrowContainer>
            </div>}

            <ShareFooterReport route={route} />
          </div>
        </div>

        <BottomNavBar
          prev={bottomBarPrev(t, dimensions, extraChapterId)}
          next={bottomBarNext(t, dimensions, extraChapterId)} />
      </div>
    );
  }
}

ExtraChapterPage.propTypes = {
  route: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  dimensions: PropTypes.array.isRequired,
  extraChapterId: PropTypes.string.isRequired,
  content: PropTypes.object.isRequired,
  footnotes: PropTypes.array.isRequired,
  externalLinks: PropTypes.array.isRequired, // ExternalLink[]
};

export default ExtraChapterPage;
