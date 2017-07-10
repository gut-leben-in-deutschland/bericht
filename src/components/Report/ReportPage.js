import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';

import {NarrowContainer, MediumContainer} from 'components/Grid/Grid';
import {ShareFooterReport} from 'components/Share/Share';
import {Footnotes} from 'components/Footnotes/Footnotes';
import {renderMarkdown} from 'components/Markdown/renderMarkdown';
import {BottomNavBar} from 'components/Navigation/BottomNavBar';
import {FencedItemList, FenceLink} from 'components/FencedItemList/FencedItemList';
import ChapterMenu from 'components/ChapterMenu/Menu';
import ChapterMenuBarContainer from 'components/ChapterMenu/BarContainer';
import {ChevronLeftIcon18, ChevronRightIcon18} from 'components/Icons/Icons';

import {DifferenceBarScrollContainer} from 'components/Flagship/DifferenceBars/ScrollContainer';
import {PercentilesScrollContainer} from 'components/Flagship/Percentiles/ScrollContainer';
import {MultiplePercentilesScrollContainer} from 'components/Flagship/MultiplePercentiles/ScrollContainer';
import MapDotsScrollContainer from 'components/Flagship/MapDots/ScrollContainer';

import {Section, LeftColumn, RightColumn, Blockquote, ReportPageChart, ScrollContainerSection, defaultReportVisitors} from './ReportPageComponents';
import Intro from './Intro';
import GovernmentMeasures from './GovernmentMeasures';

import {text, marginL} from 'theme/constants';
import {dimensionBackgroundColorAlpha20Style} from 'theme/colors';
import {dimensionTitle, prevDimension, nextDimension} from 'utils/dimension';
import {renderToExternalFenceLinks} from 'utils/external-links';


const getReportPageVisitors = (t, dimensionId) => ({
  ...defaultReportVisitors(t),
  root: (node, index, parent, visitChildren) => <MediumContainer>{visitChildren(node)}</MediumContainer>,
  zone: (node, index, parent, visitChildren) => {
    switch (node.name) {
    case 'ColumnContainer':
      return <Section key={index} {...node.parameters}>{visitChildren(node)}</Section>;
    case 'ColumnLeft':
      return <LeftColumn  key={index}{...node.parameters}>{visitChildren(node)}</LeftColumn>;
    case 'ColumnRight':
      return <RightColumn key={index} {...node.parameters}>{visitChildren(node)}</RightColumn>;
    case 'GovernmentMeasures':
      return (
        <GovernmentMeasures
          key={index}
          t={t}
          dimensionId={dimensionId}
          title={t('report/government-measures-title')}
          {...node.parameters}
          content={node}
          isLast={index === parent.children.length - 1} />
      );
    case 'DifferenceBarScrollContainer':
      return (
        <ScrollContainerSection key={index}>
          <DifferenceBarScrollContainer
            {...node.parameters}
            dimensionId={dimensionId}
            scrollBlocks={node.children} />
        </ScrollContainerSection>
      );
    case 'MapDotsScrollContainer':
      return (
        <ScrollContainerSection key={index}>
          <MapDotsScrollContainer
            {...node.parameters}
            dimensionId={dimensionId}
            scrollBlocks={node.children} />
        </ScrollContainerSection>
      );
    case 'PercentilesScrollContainer':
      return (
        <ScrollContainerSection key={index}>
          <PercentilesScrollContainer
            {...node.parameters}
            dimensionId={dimensionId}
            scrollBlocks={node.children} />
        </ScrollContainerSection>
      );
    case 'MultiplePercentilesScrollContainer':
      return (
        <ScrollContainerSection key={index}>
          <MultiplePercentilesScrollContainer
            {...node.parameters}
            dimensionId={dimensionId}
            scrollBlocks={node.children} />
        </ScrollContainerSection>
      );
    default:
      return null;
    }
  },
  marker: (node, index) => {
    switch (node.name) {
    case 'Quote':
      return <Blockquote key={index} {...node.parameters} t={t} />;
    default:
      return null;
    }
  },
  code: (node, index, parent, visitChildren) => {
    const el = defaultReportVisitors(t).code(node, index, parent, visitChildren);

    if (node.lang === 'chart') {
      return <ReportPageChart key={index}>{el}</ReportPageChart>;
    }

    return el;
  },
});

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  footer: {
    marginTop: marginL,
  },
  linkListContainer: {
    padding: `${48}px 0`,
  },
});

function bottomBarPrev(t, dimensions, dimensionId) {
  const prev = prevDimension(dimensions, dimensionId);
  if (prev !== undefined) {
    return {
      subTitle: `${t('bottom-nav-bar/dimension')} ${+prev.id}`,
      title: dimensionTitle(dimensions, prev.id),
      to: t(`route/report-${prev.id}`),
      icon: <ChevronLeftIcon18 color={text} />,
    };
  }

  return undefined;
}

function bottomBarNext(t, dimensions, dimensionId) {
  const next = nextDimension(dimensions, dimensionId);

  if (next !== undefined) {
    return {
      subTitle: `${t('bottom-nav-bar/dimension')} ${+next.id}`,
      title: dimensionTitle(dimensions, next.id),
      to: t(`route/report-${next.id}`),
      icon: <ChevronRightIcon18 color={text} />,
    };
  }

  return {
    subTitle: t('bottom-nav-bar/extra-chapter'),
    title: t('extra-chapter-X1/title'),
    to: t('route/extra-chapter-X1'),
    icon: <ChevronRightIcon18 color={text} />,
  };
}

class ReportPage extends Component {
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
    const {route, t, dimensions, dimensionId, content, footnotes, intro,
      externalLinks} = this.props;
    const {showChapterMenu} = this.state;

    const fencedItems = [].concat(
      [ footnotes.length > 0 ? <Footnotes footnotes={footnotes} t={t} /> : undefined ],
      [ <FenceLink t={t} to={t(`route/dimension-${dimensionId}`)}>{t(`report/indicators-of-this-chapter`)}</FenceLink> ],
      renderToExternalFenceLinks(t, externalLinks)
    ).filter(x => x !== undefined);

    return (
      <div className={css(styles.root)}>
        {showChapterMenu && <ChapterMenu
          t={t}
          dimensions={dimensions}
          chapterId={dimensionId}
          close={this.closeChapterMenu}
          />}

        <ChapterMenuBarContainer
          cover
          t={t}
          dimensions={dimensions}
          chapterId={dimensionId}
          isOpen={showChapterMenu}
          onClick={this.toggleChapterMenu} />

        <Intro
          t={t}
          dimensionId={dimensionId}
          title={dimensionTitle(dimensions, dimensionId)}
          intro={intro} />

        <div className={css(styles.content)}>
          {renderMarkdown(content, {visitors: getReportPageVisitors(t, dimensionId)})}
        </div>

        <div className={css(styles.footer, dimensionBackgroundColorAlpha20Style(dimensionId))}>
          {fencedItems.length > 0 &&
          <div className={css(styles.linkListContainer)}>
            <NarrowContainer>
              <FencedItemList items={fencedItems} />
            </NarrowContainer>
          </div>}

          <ShareFooterReport route={route} />
        </div>

        <BottomNavBar
          prev={bottomBarPrev(t, dimensions, dimensionId)}
          next={bottomBarNext(t, dimensions, dimensionId)} />
      </div>
    );
  }
}

ReportPage.propTypes = {
  route: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  dimensions: PropTypes.array.isRequired,
  dimensionId: PropTypes.string.isRequired,
  content: PropTypes.object.isRequired,
  footnotes: PropTypes.array.isRequired,
  intro: PropTypes.object.isRequired,
  externalLinks: PropTypes.array.isRequired,
};

export default ReportPage;
