import React, {PropTypes} from 'react';
import {withCabinet} from 'cabinet';

import PageHead from 'components/PageHead';
import Header from 'components/Header/Header';
import {DetailHeader} from 'components/Indicator/Header';
import {StickyNavBar} from 'components/Navigation/StickyNavBar';
import {BottomNavBar} from 'components/Navigation/BottomNavBar';
import {Detail} from 'components/Indicator/Detail';
import extractMarkdown from 'components/Markdown/extractMarkdown';
import {ChevronLeftIcon18, ChevronRightIcon18} from 'components/Icons/Icons';
import {containerRootClassName, pageHeadWrapperClassName} from './styles';

import {text} from 'theme/constants';
import {dimensionTitle} from 'utils/dimension';
import {hyphenatedIndicatorTitle, dimensionIdFromIndicatorId, prevIndicatorWithDetail, nextIndicatorWithDetail} from 'utils/indicator';
import {footnotesExtractor, footnotesFromExtracts} from 'utils/footnotes';


function bottomBarPrev(locale, t, dimensions, indicators, indicatorId) {
  const prevIndicator = prevIndicatorWithDetail(indicators, indicatorId);
  if (prevIndicator !== undefined) {
    return {
      subTitle: dimensionTitle(dimensions, prevIndicator.dimension_id),
      title: hyphenatedIndicatorTitle(locale, indicators, prevIndicator.id),
      to: t(`route/indicator-${prevIndicator.id}`),
      icon: <ChevronLeftIcon18 color={text} />,
    };
  }

  return undefined;
}

function bottomBarNext(locale, t, dimensions, indicators, indicatorId) {
  const nextIndicator = nextIndicatorWithDetail(indicators, indicatorId);

  if (nextIndicator !== undefined) {
    return {
      subTitle: dimensionTitle(dimensions, nextIndicator.dimension_id),
      title: hyphenatedIndicatorTitle(locale, indicators, nextIndicator.id),
      to: t(`route/indicator-${nextIndicator.id}`),
      icon: <ChevronRightIcon18 color={text} />,
    };
  }

  return {
    subTitle: '',
    title: t('bottom-nav-bar/back-to-dashboard'),
    to: t('route/dashboard'),
    icon: <ChevronRightIcon18 color={text} />,
  };
}

const emptyRootNode = {type: 'root', children: []};
function prologueFromExtracts(indicatorId, nodes) {
  if (nodes.length === 0) {
    console.warn(`prologueFromExtracts: No prologue found for indicator ${indicatorId}`); // eslint-disable-line no-console
    return emptyRootNode;
  }

  if (nodes.length > 1) {
    console.warn(`prologueFromExtracts: More than one prologue for indicator ${indicatorId}`); // eslint-disable-line no-console
  }

  return {type: 'root', children: nodes[0].children};
}

const descriptionExtractors = [
  {key: 'prologue', test({type, name}) { return type === 'zone' && name === 'Prologue'; }},
  footnotesExtractor,
];

function _Indicator({route, cabinet: {t, locale}, dimensions, indicators, sharingImage, descriptionAST}) {
  const indicatorId = route.file;
  const dimensionId = dimensionIdFromIndicatorId(indicators, indicatorId);
  const {content, extracts, meta} = extractMarkdown(descriptionAST, {extractors: descriptionExtractors});

  return (
    <div className={pageHeadWrapperClassName()}>
      <PageHead
        title={meta.title}
        description={meta.description}
        keywords={meta.keywords}
        sharingImage={sharingImage}
        route={route}
        t={t} />

      <StickyNavBar to={t(`route/dimension-${dimensionId}`)} label={dimensionTitle(dimensions, dimensionId)} />

      <DetailHeader
        locale={locale}
        t={t}
        indicators={indicators}
        indicatorId={indicatorId}
        prologue={prologueFromExtracts(indicatorId, extracts.prologue)} />

      <Detail
        route={route}
        t={t}
        dimensionId={dimensionId}
        indicatorId={indicatorId}
        content={content}
        footnotes={footnotesFromExtracts(extracts)} />

      <BottomNavBar
        prev={bottomBarPrev(locale, t, dimensions, indicators, indicatorId)}
        next={bottomBarNext(locale, t, dimensions, indicators, indicatorId)} />
    </div>
  );
}

_Indicator.propTypes = {
  route: PropTypes.object.isRequired,

  cabinet: PropTypes.object.isRequired,
  dimensions: PropTypes.array.isRequired,
  indicators: PropTypes.array.isRequired,
  sharingImage: PropTypes.string.isRequired,

  // The MDAST of the indicator description.
  descriptionAST: PropTypes.object.isRequired
};

const Indicator = withCabinet(({cabinet: {locale}, route: {file: indicatorId}}) => ({
  dimensions: `dimensions.${locale}.csv`,
  indicators: `indicators.${locale}.csv`,
  descriptionAST: `${indicatorId.split('-').join('/')}/description.${locale}.md`,
  sharingImage: `static/global-sharing-image.${locale}.png`,
}))(_Indicator);


export default ({route}) => ( // eslint-disable-line
  <div className={containerRootClassName()}>
    <Header routeKey={route.key} dimensionId={route.file.split('-')[0]} section='indicators' />
    <Indicator route={route} dimensionId={route.file} />
  </div>
);
