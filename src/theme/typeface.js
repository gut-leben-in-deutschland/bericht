import {BundesSansRegular, BundesSansBold, BundesSerifRegular, BundesSerifBold,
  BundesSerifRegularItalic, BundesSerifBoldItalic} from 'theme/fonts';

/**
 * Typeface
 *
 * This file describes the application typeface superfamily as a collection of
 * fonts that can be used throughout the application. Because font properties
 * like size and line-height belong together, we define them here so that they
 * can be used in the application using CSS Modules composition:
 *
 *   .myHeading {
 *     ...sansRegular16,
 *     color: 'blue';
 *   };
 *
 * A typeface designates a consistent visual appearance or style which can be
 * a “family” or related set of fonts. A typeface superfamily includes typefaces
 * with significant structural differences, but some design relationship – a
 * property that should hold for an application if we want consistent typography.
 *
 * A font is a particular size, weight and style of a typeface. Every style
 * object defined in this file can be considered a font that is part of the
 * application's typeface.
 *
 * Naming scheme:
 *
 *   .sansRegularIt16 = sans...Regular...It.....16
 *                             WEIGHT    STYLE  SIZE
 */

const sansRegular = {
  fontFamily: BundesSansRegular,
  fontWeight: 'normal',
  fontStyle: 'normal'
};
const sansBold = {
  fontFamily: BundesSansBold,
  fontWeight: 'normal',
  fontStyle: 'normal'
};
const serifRegular = {
  fontFamily: BundesSerifRegular,
  fontWeight: 'normal',
  fontStyle: 'normal'
};
const serifRegularIt = {
  fontFamily: BundesSerifRegularItalic,
  fontWeight: 'normal',
  fontStyle: 'normal'
};
const serifBold = {
  fontFamily: BundesSerifBold,
  fontWeight: 'normal',
  fontStyle: 'normal'
};
const serifBoldIt = {
  fontFamily: BundesSerifBoldItalic,
  fontWeight: 'normal',
  fontStyle: 'normal'
};


export const sansRegular12 = {
  ...sansRegular,
  fontSize: '12px',
  lineHeight: 1.5
};
export const sansRegular14 = {
  ...sansRegular,
  fontSize: '14px',
  lineHeight: 1.5
};
export const sansRegular16 = {
  ...sansRegular,
  fontSize: '16px',
  lineHeight: 1.5
};
export const sansRegular18 = {
  ...sansRegular,
  fontSize: '18px',
  lineHeight: 1.5
};
export const sansRegular20 = {
  ...sansRegular,
  fontSize: '20px',
  lineHeight: 1.25
};
export const sansRegular22 = {
  ...sansRegular,
  fontSize: '22px',
  lineHeight: 1.25
};
export const sansRegular24 = {
  ...sansRegular,
  fontSize: '24px',
  lineHeight: 1.25
};
export const sansRegular26 = {
  ...sansRegular,
  fontSize: '26px',
  lineHeight: 1.25
};
export const sansRegular32 = {
  ...sansRegular,
  fontSize: '32px',
  lineHeight: 1.25
};


export const sansBold12 = {
  ...sansBold,
  fontSize: '12px',
  lineHeight: 1.5
};
export const sansBold13 = {
  ...sansBold,
  fontSize: '13px',
  lineHeight: 1.5
};
export const sansBold14 = {
  ...sansBold,
  fontSize: '14px',
  lineHeight: 1.5
};
export const sansBold15 = {
  ...sansBold,
  fontSize: '15px',
  lineHeight: 1.5
};
export const sansBold16 = {
  ...sansBold,
  fontSize: '16px',
  lineHeight: 1.5
};
export const sansBold18 = {
  ...sansBold,
  fontSize: '18px',
  lineHeight: 1.5
};
export const sansBold20 = {
  ...sansBold,
  fontSize: '20px',
  lineHeight: 1.25
};
export const sansBold22 = {
  ...sansBold,
  fontSize: '22px',
  lineHeight: 1.25
};
export const sansBold24 = {
  ...sansBold,
  fontSize: '24px',
  lineHeight: 1.25
};
export const sansBold40 = {
  ...sansBold,
  fontSize: '40px',
  lineHeight: 1.25
};
export const sansBold90 = {
  ...sansBold,
  fontSize: '90px',
  lineHeight: 1.25
};


export const serifRegular12 = {
  ...serifRegular,
  fontSize: '12px',
  lineHeight: 1.5
};
export const serifRegular15 = {
  ...serifRegular,
  fontSize: '15px',
  lineHeight: 1.5
};
export const serifRegular16 = {
  ...serifRegular,
  fontSize: '16px',
  lineHeight: 1.5
};
export const serifRegular18 = {
  ...serifRegular,
  fontSize: '18px',
  lineHeight: 1.5
};
export const serifRegular20 = {
  ...serifRegular,
  fontSize: '20px',
  lineHeight: 1.25
};
export const serifRegular22 = {
  ...serifRegular,
  fontSize: '22px',
  lineHeight: 1.25
};
export const serifRegular24 = {
  ...serifRegular,
  fontSize: '24px',
  lineHeight: 1.25
};
export const serifRegular26 = {
  ...serifRegular,
  fontSize: '26px',
  lineHeight: 1.25
};
export const serifRegular30 = {
  ...serifRegular,
  fontSize: '30px',
  lineHeight: 1.25
};
export const serifRegular36 = {
  ...serifRegular,
  fontSize: '36px',
  lineHeight: 1.25
};
export const serifRegular40 = {
  ...serifRegular,
  fontSize: '40px',
  lineHeight: 1.25
};
export const serifRegular48 = {
  ...serifRegular,
  fontSize: '48px',
  lineHeight: 1.25
};
export const serifRegular72 = {
  ...serifRegular,
  fontSize: '72px',
  lineHeight: 1.25
};
export const serifRegular94 = {
  ...serifRegular,
  fontSize: '94px',
  lineHeight: 1.25
};

export const serifRegularIt26 = {
  ...serifRegularIt,
  fontSize: '26px',
  lineHeight: 1.25
};


export const serifBold18 = {
  ...serifBold,
  fontSize: '18px',
  lineHeight: 1.5
};
export const serifBold22 = {
  ...serifBold,
  fontSize: '22px',
  lineHeight: 1.25
};

export const serifBoldIt16 = {
  ...serifBoldIt,
  fontSize: '16px',
  lineHeight: 1.5
};
