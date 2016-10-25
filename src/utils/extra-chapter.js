
// type ExtraChapterId = 'X1' | 'X2' | 'X3'

export const allExtraChapterIds = [
  'X1', 'X2', 'X3'
];

export function extraChapterTitleTranslationKey(extraChapterId) {
  return `extra-chapter-${extraChapterId}/title`;
}

export function extraChapterShortTitleTranslationKey(extraChapterId) {
  return `extra-chapter-${extraChapterId}/short-title`;
}
