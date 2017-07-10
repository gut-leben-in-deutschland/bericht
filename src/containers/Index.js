import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import {withCabinet} from 'cabinet';

import PageHead from 'components/PageHead';
import Header from 'components/Header/Header';
import renderMarkdown, {defaultVisitors} from 'components/Markdown/renderMarkdown';
import extractMarkdown from 'components/Markdown/extractMarkdown';
import {Banner} from 'components/LandingPage/Banner';
import {ShareFooterReport} from 'components/Share/Share';
import {NarrowContainer} from 'components/Grid/Grid';
import {Footnotes} from 'components/Footnotes/Footnotes';
import FootnoteReference from 'components/Footnotes/FootnoteReference';
import {Strong, Emphasis, Blockquote} from 'components/Report/ReportPageComponents';
import {containerRootClassName, pageHeadWrapperClassName} from './styles';

import {Prologue} from 'components/LandingPage/Prologue';
import {DesktopDimensionCards} from 'components/LandingPage/Desktop/DesktopDimensionCards';
import {DesktopTableOfContents} from 'components/LandingPage/Desktop/DesktopTableOfContents';
import {MobileDimensionCards} from 'components/LandingPage/Mobile/MobileDimensionCards';
import {MobileTableOfContents} from 'components/LandingPage/Mobile/MobileTableOfContents';

import {softBeige, softGrey} from 'theme/constants';
import {createMediaQuery} from 'theme/mediaQueries';
import {sansRegular18} from 'theme/typeface';

import {footnotesExtractor, footnotesFromExtracts} from 'utils/footnotes';


const windowEvents = ['resize'];

// This is the breakpoint below which we show the mobile version
// of the landing page.
const minDesktopVisWidth = 1024;

const extractors = [
  footnotesExtractor,
];

const styles = StyleSheet.create({
  verticalFlexContainer: {
    display: 'flex',
    flexDirection: 'column',
  },

  footnotesContainer: {
    paddingBottom: 40,
  },
  footnotes: {
    borderBottom: `1px solid ${softGrey}`,
    borderTop: `1px solid ${softGrey}`,
  },

  paragraph: {
    ...sansRegular18,
    margin: `0 0 ${18}px 0`,
  },

  shareContainer: {
    backgroundColor: softBeige,
  },

  visibleOnMobile: {
    [createMediaQuery(minDesktopVisWidth, Infinity)]: {
      display: 'none',
    },
  },
  visibleOnDesktop: {
    display: 'none',
    [createMediaQuery(minDesktopVisWidth, Infinity)]: {
      display: 'block',
    },
  },
});

const markdownVisitors = (t, dimensions, indicators) => ({
  ...defaultVisitors(t),
  root: (node, index, parent, visitChildren) => {
    return (
      <div key={index} className={css(styles.verticalFlexContainer)}>
        {visitChildren(node)}
      </div>
    );
  },

  footnoteReference: (node, index) => <FootnoteReference key={index} identifier={node.identifier} />,

  zone: (node, index, parent, visitChildren) => {
    if (node.name === 'Prologue') {
      return <Prologue key={index}>{visitChildren(node)}</Prologue>;
    }

    return defaultVisitors(t).zone(node, index, parent, visitChildren);
  },

  marker: (node, index, parent, visitChildren) => {
    if (node.name === 'DimensionCards') {
      return (
        <div key={index} className={css(styles.verticalFlexContainer)}>
          <div className={css(styles.visibleOnMobile)}>
            <MobileDimensionCards t={t} dimensions={dimensions} indicators={indicators} />
          </div>
          <div className={css(styles.visibleOnDesktop)}>
            <DesktopDimensionCards t={t} dimensions={dimensions} indicators={indicators} />
          </div>
        </div>
      );
    }

    if (node.name === 'TableOfContents') {
      return (
        <div key={index} className={css(styles.verticalFlexContainer)}>
          <div className={css(styles.visibleOnMobile)}>
            <MobileTableOfContents t={t} dimensions={dimensions} />
          </div>
          <div className={css(styles.visibleOnDesktop)}>
            <DesktopTableOfContents t={t} dimensions={dimensions} />
          </div>
        </div>
      );
    }

    if (node.name === 'Quote') {
      return <Blockquote key={index} {...node.parameters} t={t} />;
    }

    // No 'marker' in defaultVisitors, fall back to default.
    return defaultVisitors(t).default(node, index, parent, visitChildren);
  },

  heading: (node, index, parent, visitChildren) => {
    return (
      <div key={index} style={{marginTop: 47}}>
        <NarrowContainer>
          {defaultVisitors(t).heading(node, index, parent, visitChildren)}
        </NarrowContainer>
      </div>
    );
  },

  paragraph: (node, index, parent, visitChildren) => {
    if (parent.type === 'root') {
      return (
        <NarrowContainer key={index}>
          <p className={css(styles.paragraph)}>{visitChildren(node)}</p>
        </NarrowContainer>
      );
    }

    if (parent.type === 'listItem') {
      return visitChildren(node);
    }

    return <p className={css(styles.paragraph)} key={index}>{visitChildren(node)}</p>;
  },
  strong: (node, index, parent, visitChildren) => <Strong key={index}>{visitChildren(node)}</Strong>,
  emphasis: (node, index, parent, visitChildren) => <Emphasis key={index}>{visitChildren(node)}</Emphasis>,

});

class _IndexContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {innerWidth: undefined};
    this.updateMeasurements = () => {
      this.setState({innerWidth: window.innerWidth});
    };
  }

  componentDidMount() {
    this.updateMeasurements();
    windowEvents.forEach(e =>
      window.addEventListener(e, this.updateMeasurements));
  }
  componentWillUnmount() {
    windowEvents.forEach(e =>
      window.removeEventListener(e, this.updateMeasurements));
  }

  render() {
    const {route, cabinet: {t}, dimensions, indicators, sharingImage} = this.props;

    const {content, extracts, meta} = extractMarkdown(this.props.introduction, {extractors});
    const footnotes = footnotesFromExtracts(extracts);

    const visitors = markdownVisitors(t, dimensions, indicators);

    return (
      <div className={pageHeadWrapperClassName()}>
        <PageHead
          title={meta.title}
          description={meta.description}
          keywords={meta.keywords}
          sharingImage={sharingImage}
          route={route}
          t={t}
        />
        <Banner t={t} />

        {renderMarkdown(content, {visitors})}

        {footnotes.length > 0 &&
        <div className={css(styles.footnotesContainer)}>
          <NarrowContainer>
            <div className={css(styles.footnotes)}>
              <Footnotes t={t} footnotes={footnotes} />
            </div>
          </NarrowContainer>
        </div>}

        <div className={css(styles.shareContainer)}>
          <ShareFooterReport route={route} />
        </div>
      </div>
    );
  }
}

_IndexContainer.propTypes = {
  route: PropTypes.object.isRequired,

  // withCabinet
  cabinet: PropTypes.object.isRequired,
  introduction: PropTypes.object.isRequired,
  sharingImage: PropTypes.string.isRequired,
  dimensions: PropTypes.array.isRequired,
  indicators: PropTypes.array.isRequired,
};

const IndexContainer = withCabinet(({cabinet: {locale}}) => ({
  dimensions: `dimensions.${locale}.csv`,
  indicators: `indicators.${locale}.csv`,
  introduction: `static/landing-page/index.${locale}.md`,
  sharingImage: `static/global-sharing-image.${locale}.png`,
}))(_IndexContainer);


export default ({route}) => ( // eslint-disable-line
  <div className={containerRootClassName()}>
    <Header routeKey={route.key} />
    <IndexContainer route={route} dimensionId={route.file} />
  </div>
);
