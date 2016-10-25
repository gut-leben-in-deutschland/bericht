import React, {PropTypes} from 'react';
import {withCabinet} from 'cabinet';

import PageHead from 'components/PageHead';
import Header from 'components/Header/Header';
import extractMarkdown from 'components/Markdown/extractMarkdown';
import ExtraChapterPage from 'components/ExtraChapter/ExtraChapterPage';
import {containerRootClassName, pageHeadWrapperClassName} from './styles';

import {footnotesExtractor, footnotesFromExtracts} from 'utils/footnotes';
import {externalLinksExtractor, externalLinksFromExtracts} from 'utils/external-links';
import {extraChapterColor} from 'theme/constants';

const extractors = [
  footnotesExtractor,
  externalLinksExtractor,
];

const _ExtraChapter = ({sharingImage, extraChapterAST, dimensions, cabinet: {t, locale}, route}) => {
  const extraChapterId = route.file;
  const {content, extracts, meta} = extractMarkdown(extraChapterAST, {extractors});

  return (
    <div className={pageHeadWrapperClassName()}>
      <PageHead
        title={meta.title}
        description={meta.description}
        keywords={meta.keywords}
        sharingImage={sharingImage}
        route={route}
        t={t} />
      <ExtraChapterPage
        route={route}
        t={t}
        locale={locale}
        extraChapterId={extraChapterId}
        content={content}
        footnotes={footnotesFromExtracts(extracts)}
        externalLinks={externalLinksFromExtracts(extracts)}
        dimensions={dimensions} />
    </div>
  );
};

_ExtraChapter.propTypes = {
  sharingImage: PropTypes.string.isRequired,
  extraChapterAST: PropTypes.object.isRequired,
  cabinet: PropTypes.object.isRequired,
  dimensions: PropTypes.array.isRequired,
  route: PropTypes.object.isRequired,
};

const ExtraChapter = withCabinet(({cabinet: {locale}, route: {file}}) => ({
  dimensions: `dimensions.${locale}.csv`,
  extraChapterAST: `${file}/index.${locale}.md`,
  sharingImage: `static/global-sharing-image.${locale}.png`,
}))(_ExtraChapter);


export default ({route}) => ( // eslint-disable-line
  <div className={containerRootClassName()}>
    <Header routeKey={route.key} ribbonColor={extraChapterColor} section='report' />
    <ExtraChapter route={route} dimensionId={route.file} />
  </div>
);
