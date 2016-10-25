import React, {PropTypes} from 'react';
import {withCabinet} from 'cabinet';

import PageHead from 'components/PageHead';
import Header from 'components/Header/Header';
import extractMarkdown from 'components/Markdown/extractMarkdown';
import StaticPage from 'components/Static/StaticPage';
import {containerRootClassName, pageHeadWrapperClassName} from './styles';

import {footnotesExtractor, footnotesFromExtracts} from 'utils/footnotes';
import {externalLinksExtractor, externalLinksFromExtracts} from 'utils/external-links';

const extractors = [
  footnotesExtractor,
  externalLinksExtractor,
];

const _Static = ({sharingImage, extraChapterAST, cabinet: {t, locale}, route}) => {
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
        t={t}
      />
      <StaticPage
        t={t}
        locale={locale}
        extraChapterId={extraChapterId}
        content={content}
        footnotes={footnotesFromExtracts(extracts)}
        externalLinks={externalLinksFromExtracts(extracts)}
      />
    </div>
  );
};

_Static.propTypes = {
  sharingImage: PropTypes.string.isRequired,
  extraChapterAST: PropTypes.object.isRequired,
  cabinet: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

const Static = withCabinet(({cabinet: {locale}, route: {file}}) => ({
  extraChapterAST: `${file}.${locale}.md`,
  sharingImage: `static/global-sharing-image.${locale}.png`,
}))(_Static);


export default ({route}) => ( // eslint-disable-line
  <div className={containerRootClassName()}>
    <Header routeKey={route.key} />
    <Static route={route} />
  </div>
);
