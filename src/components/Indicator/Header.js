import React, {Component, PropTypes} from 'react';
import {withCabinet} from 'cabinet';
import {StyleSheet, css} from 'aphrodite';

import {NarrowContainer} from 'components/Grid/Grid';
import Markdown from 'components/Markdown/Markdown';
import FootnoteReference from 'components/Footnotes/FootnoteReference';
import renderMarkdown, {defaultVisitors} from 'components/Markdown/renderMarkdown';
import Heading from 'components/Heading/Heading';

import {sansRegular14} from 'theme/typeface';
import {white, text, midGrey} from 'theme/constants';

import {hyphenatedIndicatorTitle} from 'utils/indicator';
import {hyphenate} from 'utils/hyphenate';
import {dimensionTitle} from 'utils/dimension';


const EXPANDER_HEIGHT = 40;

// Subtract the bottom margin of the last element in the excerpt/body, which is
// usually a paragraph, which has 1em margin, which we assume is 16px.
const HEADER_BOTTOM_PADDING = EXPANDER_HEIGHT - 16;

const styles = StyleSheet.create({
  header: {
    backgroundColor: white,
    margin: '28px auto 0',
    position: 'relative',
    paddingBottom: HEADER_BOTTOM_PADDING
  },
  title: {
    color: text,
    marginBottom: 8,
  },
  expandableContent: {
    overflow: 'hidden'
  },
  expander: {
    ...sansRegular14,
    color: midGrey,

    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: EXPANDER_HEIGHT,
    lineHeight: `${EXPANDER_HEIGHT}px`,
    textAlign: 'center',
    cursor: 'pointer'
  }
});

const _OverviewHeader = ({cabinet: {t, locale}}) => {
  return (
    <div className={css(styles.header)}>
      <div className={css(styles.title)}>
        <Heading level={1}>{t('header/dashboard')}</Heading>
      </div>
      <Markdown src={`static/dashboard/index.${locale}.md`} />
    </div>
  );
};

_OverviewHeader.propTypes = {
  cabinet: PropTypes.object.isRequired
};

export const OverviewHeader = withCabinet()(_OverviewHeader);

const _DimensionHeader = ({dimensions, dimensionId, cabinet: {locale}}) => {
  return (
    <div className={css(styles.header)}>
      <div className={css(styles.title)}>
        <Heading level={1}>{hyphenate(locale, dimensionTitle(dimensions, dimensionId))}</Heading>
      </div>
      <Markdown src={`${dimensionId}/description.${locale}.md`} />
    </div>
  );
};

_DimensionHeader.propTypes = {
  cabinet: PropTypes.object.isRequired,
  dimensions: PropTypes.array.isRequired,
  dimensionId: PropTypes.string.isRequired,
};

export const DimensionHeader = withCabinet()(_DimensionHeader);

const indicatorHeaderVisitors = (t) => ({
  ...defaultVisitors(t),
  footnoteReference: (node, index) => <FootnoteReference key={index} identifier={node.identifier} />
});

export class DetailHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {isExpanded: false};

    this.toggleBody = () => {
      this.setState(previousState => ({
        isExpanded: !previousState.isExpanded
      }));
    };
  }

  render() {
    const {locale, t, indicatorId, indicators, prologue: {children}} = this.props;
    const {isExpanded} = this.state;

    const excerpt = {type: 'root', children: children.slice(0, 1)};
    const rest = {type: 'root', children: children.slice(1)};

    return (
      <div className={css(styles.header, styles.expandableHeader)}>
        <NarrowContainer>
          <div className={css(styles.title)}>
            <Heading level={1}>{hyphenatedIndicatorTitle(locale, indicators, indicatorId)}</Heading>
          </div>
          {renderMarkdown(excerpt, {visitors: indicatorHeaderVisitors(t)})}
          {rest.children.length > 0 && (
            <div className={css(styles.expandableContent)} style={{height: isExpanded ? 'auto' : 0}}>
              {renderMarkdown(rest, {visitors: indicatorHeaderVisitors(t)})}
            </div>
          )}
          {rest.children.length > 0 && (
            <div onClick={this.toggleBody} className={css(styles.expander)}>
              {t(isExpanded ? 'indicator-header/less' : 'indicator-header/more')}
            </div>
          )}
        </NarrowContainer>
      </div>
    );
  }
}

DetailHeader.propTypes = {
  locale: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  indicatorId: PropTypes.string.isRequired, // IndicatorId (format: 'XX-YY')
  indicators: PropTypes.array.isRequired,
  prologue: PropTypes.object.isRequired // MDAST
};
