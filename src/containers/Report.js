import React, {PropTypes} from 'react';
import {withCabinet} from 'cabinet';

import PageHead from 'components/PageHead';
import Header from 'components/Header/Header';
import extractMarkdown from 'components/Markdown/extractMarkdown';
import ReportPage from 'components/Report/ReportPage';
import {containerRootClassName, pageHeadWrapperClassName} from './styles';

import {footnotesExtractor, footnotesFromExtracts} from 'utils/footnotes';
import {externalLinksExtractor, externalLinksFromExtracts} from 'utils/external-links';


const extractors = [
  {key: 'intro', test: (node) => node.type === 'zone' && node.name === 'Prologue'},
  footnotesExtractor,
  externalLinksExtractor,
];

const _Report = ({sharingImage, reportAST, dimensions, cabinet: {t, locale}, route}) => {
  const dimensionId = route.file;
  const {content, extracts, meta} = extractMarkdown(reportAST, {extractors});

  return (
    <div className={pageHeadWrapperClassName()}>
      <PageHead
        title={meta.title}
        description={meta.description}
        keywords={meta.keywords}
        sharingImage={sharingImage}
        route={route}
        t={t} />
      <ReportPage
        route={route}
        t={t}
        dimensionId={dimensionId}
        locale={locale}
        content={content}
        footnotes={footnotesFromExtracts(extracts)}
        dimensions={dimensions}
        intro={extracts.intro[0]}
        externalLinks={externalLinksFromExtracts(extracts)} />
    </div>
  );
};

_Report.propTypes = {
  sharingImage: PropTypes.string.isRequired,
  reportAST: PropTypes.object.isRequired,
  cabinet: PropTypes.object.isRequired,
  dimensions: PropTypes.array.isRequired,
  route: PropTypes.object.isRequired,
};

const Report = withCabinet(({cabinet: {locale}, route: {file}}) => ({
  dimensions: `dimensions.${locale}.csv`,
  sharingImage: `${file}/sharing-image.${locale}.png`,
  reportAST: `${file}/report.${locale}.md`,
}))(_Report);


export default ({route}) => ( // eslint-disable-line
  <div className={containerRootClassName()}>
    <Header routeKey={route.key} dimensionId={route.file} section='report' />
    <Report route={route} />
  </div>
);
