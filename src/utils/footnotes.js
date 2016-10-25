
// The extracts are MDAST nodes of type 'FootnoteDefinition':
//
//
// interface FootnoteDefinition {
//
//   // The identifier as given in the text, without the leading caret.
//   // Eg. [^1] => identifier === "1".
//   identifier: string;
//
//   // MDAST nodes which contain the definition.
//   children: MDAST[];
//
// }


const extractorKey = 'footnotes';


// Ready-made Markdown extractor for external links.
export const footnotesExtractor = {
  key: extractorKey,
  test(node) {
    return node.type === 'footnoteDefinition';
  },
};


// footnotesFromExtracts(extracts: ?): FootnoteDefinition[]
export function footnotesFromExtracts(extracts) {
  if (extracts[extractorKey] !== undefined) {
    return extracts[extractorKey];
  }

  // eslint-disable-next-line
  console.warn('footnotesFromExtracts: required key not present in extracts', extracts);

  return [];
}
