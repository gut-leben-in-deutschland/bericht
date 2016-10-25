export const breakpointS = [0, 640];
export const breakpointM = [641, 1024];
export const breakpointL = [1025, 1440];

// em for best browser support http://zellwk.com/blog/media-query-units/
const toEm = (px) => `${px / 16}em`;


// Create a screen-only @media query which matches min/max width. The max
// value may be Infinity if you want to match everything from min and up.
export function createMediaQuery(min, max) {
  return '@media ' + [
    'only screen',
    `(min-width: ${toEm(min)})`,
    max !== Infinity && `(max-width: ${toEm(max)})` || undefined
  ].filter(x => x !== undefined).join(' and ');
}

// For "tiny" devices like the iPhone 5
export const onlyXS = '@media only screen and (max-height: 568px)';

export const s = `@media only screen`;
export const onlyS = createMediaQuery(...breakpointS);

export const m = `@media only screen and (min-width: ${toEm(breakpointM[0])})`;
export const onlyM = createMediaQuery(...breakpointM);

export const l = `@media only screen and (min-width: ${toEm(breakpointL[0])})`;
export const onlyL = createMediaQuery(...breakpointL);

export const xl = `@media only screen and (min-width: ${toEm(breakpointL[1] + 1)})`;
