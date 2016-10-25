
// These z-indexes are used in the root stacking context.

// This one is used for full-screen overlays. Only a single element should
// have this z-index at any given time.
export const zIndexOverlay = 1000;

// Elements which stick to the top of the page when the user scrolls down
// the page.
export const zIndexSticky = 500;
