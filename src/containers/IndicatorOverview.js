import React, {PropTypes} from 'react';
import {withCabinet} from 'cabinet';

import PageHead from 'components/PageHead';
import Header from 'components/Header/Header';
import {IndicatorOverview} from 'components/Indicator/Overview';
import extractMarkdown from 'components/Markdown/extractMarkdown';
import {containerRootClassName, pageHeadWrapperClassName} from './styles';

function _Overview({location, cabinet, cabinet: {t}, dimensions, indicators, route, sharingImage, descriptionAST}) {
  const filter = location.query === undefined || location.query.keyword === undefined
    ? undefined
    : {type: 'keyword', keyword: location.query.keyword};

  const {meta} = extractMarkdown(descriptionAST);

  return (
    <div className={pageHeadWrapperClassName()}>
      <PageHead
        title={meta.title}
        description={meta.description}
        keywords={meta.keywords}
        sharingImage={sharingImage}
        route={route}
        t={t} />
      <IndicatorOverview
        route={route}
        cabinet={cabinet}
        dimensions={dimensions}
        indicators={indicators}
        filter={filter} />
    </div>
  );
}

_Overview.propTypes = {
  location: PropTypes.any.isRequired,
  route: PropTypes.object.isRequired,
  cabinet: PropTypes.object.isRequired,
  sharingImage: PropTypes.string.isRequired,
  descriptionAST: PropTypes.object.isRequired,

  dimensions: PropTypes.array.isRequired,
  indicators: PropTypes.array.isRequired
};

const Overview = withCabinet(({cabinet: {locale}}) => ({
  dimensions: `dimensions.${locale}.csv`,
  indicators: `indicators.${locale}.csv`,
  descriptionAST: `static/dashboard/index.${locale}.md`,
  sharingImage: `static/global-sharing-image.${locale}.png`,
}))(_Overview);


export default ({route, location}) => ( // eslint-disable-line
  <div className={containerRootClassName()}>
    <Header routeKey={route.key} section='indicators' />
    <Overview route={route} location={location} />
  </div>
);
