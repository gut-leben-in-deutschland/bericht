import PropTypes from 'prop-types';
import React from 'react';
import {withCabinet} from 'cabinet';

import PageHead from 'components/PageHead';
import Header from 'components/Header/Header';
import {IndicatorOverview} from 'components/Indicator/Overview';
import extractMarkdown from 'components/Markdown/extractMarkdown';
import {containerRootClassName, pageHeadWrapperClassName} from './styles';


function _Dimension({route, dimensionId, cabinet, dimensions, indicators, sharingImage, descriptionAST}) {
  const {meta} = extractMarkdown(descriptionAST);

  return (
    <div className={pageHeadWrapperClassName()}>
      <PageHead
        title={meta.title}
        description={meta.description}
        keywords={meta.keywords}
        sharingImage={sharingImage}
        route={route}
        t={cabinet.t} />
      <IndicatorOverview
        route={route}
        cabinet={cabinet}
        dimensions={dimensions}
        indicators={indicators}
        filter={{type: 'dimension', dimensionId}} />
    </div>
  );
}

_Dimension.propTypes = {
  route: PropTypes.object.isRequired,
  dimensionId: PropTypes.string.isRequired,
  cabinet: PropTypes.object.isRequired,
  sharingImage: PropTypes.string.isRequired,
  descriptionAST: PropTypes.object.isRequired,
  dimensions: PropTypes.array.isRequired,
  indicators: PropTypes.array.isRequired,
};

const Dimension = withCabinet(({cabinet: {locale}, dimensionId}) => ({
  dimensions: `dimensions.${locale}.csv`,
  indicators: `indicators.${locale}.csv`,
  descriptionAST: `${dimensionId}/description.${locale}.md`,
  sharingImage: `static/global-sharing-image.${locale}.png`,
}))(_Dimension);


export default ({route}) => ( // eslint-disable-line
  <div className={containerRootClassName()}>
    <Header routeKey={route.key} dimensionId={route.file} section='indicators' />
    <Dimension route={route} dimensionId={route.file} />
  </div>
);
