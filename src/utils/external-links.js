import React from 'react';
import {FenceLink} from 'components/FencedItemList/FencedItemList';


// This type is how external links are represented in the application, after
// they are extracted from the markdown file and processed by
// 'externalLinksFromExtracts'.
//
// type ExternalLink = { title: string, href: string }


const extractorKey = 'externalLinks';


// Ready-made Markdown extractor for external links.
export const externalLinksExtractor = {
  key: extractorKey,
  test(node) {
    return node.type === 'marker' && node.name === 'ExternalLink';
  },
};


// externalLinksFromExtracts(extracts: ?): ExternalLink[]
export function externalLinksFromExtracts(extracts) {
  if (extracts[extractorKey] !== undefined) {
    return extracts[extractorKey].map(({parameters: {title, href}}) => {
      return {title, href};
    });
  }

  // eslint-disable-next-line
  console.warn('externalLinksFromExtracts: required key not present in extracts', extracts);

  return [];
}


// renderToExternalFenceLinks(xs: ExternalLink[]): ReactNode[]
export function renderToExternalFenceLinks(t, externalLinks) {
  return externalLinks.map(({title, href}) => <FenceLink t={t} to={href}>{title}</FenceLink>);
}
