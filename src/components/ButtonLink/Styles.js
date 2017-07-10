import {rgb} from 'd3-color';
import {StyleSheet} from 'aphrodite';

import {BundesSansRegular} from 'theme/fonts';
import {black, text, white, link, lightGrey} from 'theme/constants';
import {sansBold13, sansBold16, sansBold18} from 'theme/typeface';


const borderWidth = '2px';
const borderRadius = 2;

const normalBg = '#FFFFFF';
const normalBorder = '#5F8FB4';
const normalText = '#5F8FB4';

const hoverBg = '#EFF3F7';
const hoverBorder = '#4C7290';
const hoverText = '#4C7290';

const focusBg = '#D8E4ED';
const focusBorder = '#39556C';
const focusText = '#39556C';

const activeBg = '#DFE9F0';
const activeBorder = '#42637D';
const activeText = '#42637D';

const disabledBg = '#FFFFFF';
const disabledBorder = '#BBBBBB';
const disabledText = '#BBBBBB';

const primaryNormalBg = '#5F8FB4';
const primaryNormalBorder = '#5F8FB4';
const primaryNormalText = '#FFFFFF';

const primaryHoverBg = '#4C7290';
const primaryHoverBorder = '#4C7290';
const primaryHoverText = '#FFFFFF';

const primaryFocusBg = '#39556C';
const primaryFocusBorder = '#39556C';
const primaryFocusText = '#FFFFFF';

const primaryActiveBg = '#42637D';
const primaryActiveBorder = '#42637D';
const primaryActiveText = '#FFFFFF';

const primaryDisabledBg = '#BBBBBB';
const primaryDisabledBorder = '#BBBBBB';
const primaryDisabledText = '#FFFFFF';

export const base = {
  fontFamily: BundesSansRegular,

  // reset
  boxSizing: 'border-box',
  borderStyle: 'none',
  color: 'inherit',
  cursor: 'pointer',
  display: 'inline-block',
  fontWeight: 'normal',
  lineHeight: 'normal',
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  outline: 'none',
  overflow: 'visible',
  padding: 0,
  textAlign: 'center',
  textDecoration: 'none',
  textTransform: 'none',
  touchAction: 'manipulation',
  verticalAlign: 'baseline',

  // Weird FF pseudo-element padding issue for buttons
  '::-moz-focus-inner': {
    borderStyle: 'none',
    padding: 0
  },
};

export const button = {
  ...base,
  ...sansBold13,

  borderWidth: borderWidth,
  borderStyle: 'solid',
  borderColor: 'magenta',
  borderRadius: borderRadius,
  padding: '0 20px',

  height: 40,
  lineHeight: '40px',

  textTransform: 'uppercase',
};


export const linkStyleObject16 = {
  ...base,
  ...sansBold16,
  color: link,

  ':hover': {
    textDecoration: 'underline',
  },
};

export const linkStyleObject18 = {
  ...base,
  ...sansBold18,
  color: link,

  ':hover': {
    textDecoration: 'underline',
  },
};

const transitionDuration = 0.12;


// Primary button with fixed colors for normal and hover states.
export function primaryButtonStyleObject(normal, hover) {
  return {
    ...button,

    backgroundColor: normal.fill,
    borderColor: normal.fill,
    color: normal.stroke,

    transition: `all ${transitionDuration}s`,

    ':hover': {
      backgroundColor: hover.fill,
      borderColor: hover.fill,
      color: hover.stroke,
    },
  };
}

// Primary button which blends with its background. Is slightly transparent
// but becomes fully opaque on hover.
export function blendedPrimaryButtonStyleObject(fillColor, strokeColor) {
  const {r, g, b} = rgb(fillColor);

  return {
    ...button,

    backgroundColor: `rgba(${r},${g},${b},.8)`,
    borderColor: 'transparent',
    color: strokeColor,

    transition: `all ${transitionDuration}s`,

    ':hover': {
      backgroundColor: fillColor,
      borderColor: 'transparent',
      color: strokeColor,
    },
  };
}

// The secondary button uses the stroke color for the text and border,
// background remains transparent at all times. Only the border color changes
// on hover.
export function secondaryButtonStyleObject(normalStrokeColor, hoverStrokeColor) {
  return {
    ...button,

    backgroundColor: 'transparent',
    borderColor: normalStrokeColor,
    color: normalStrokeColor,

    transition: `all ${transitionDuration}s`,

    ':hover': {
      backgroundColor: 'transparent',
      borderColor: hoverStrokeColor,
      color: hoverStrokeColor,
    },
  };
}

// Fully transparent background, slightly transparent border. On hover
// background increases opacity and border becomes fully opaque.
export function blendedSecondaryButtonStyleObject(fillColor, strokeColor) {
  const {r, g, b} = rgb(fillColor);

  return {
    ...button,

    backgroundColor: 'transparent',
    borderColor: `rgba(${r},${g},${b},.8)`,
    color: strokeColor,

    transition: `all ${transitionDuration}s`,

    ':hover': {
      backgroundColor: `rgba(${r},${g},${b},.1)`,
      borderColor: strokeColor,
      color: strokeColor,
    },
  };
}


export default StyleSheet.create({
  base: {...base},
  button: {
    backgroundColor: normalBg,
    borderStyle: 'solid',
    borderWidth: borderWidth,
    borderColor: normalBorder,
    borderRadius: borderRadius,
    color: normalText,
    padding: '0.5em 1em',
    ':hover': {
      backgroundColor: hoverBg,
      borderColor: hoverBorder,
      color: hoverText
    },
    ':focus': {
      backgroundColor: focusBg,
      borderColor: focusBorder,
      color: focusText
    },
    ':active': {
      backgroundColor: activeBg,
      borderColor: activeBorder,
      color: activeText
    },
    ':disabled': {
      backgroundColor: disabledBg,
      borderColor: disabledBorder,
      color: disabledText,
      cursor: 'not-allowed'
    }
  },
  primary: {
    backgroundColor: primaryNormalBg,
    borderStyle: 'solid',
    borderWidth: borderWidth,
    borderColor: primaryNormalBorder,
    borderRadius: borderRadius,
    color: primaryNormalText,
    padding: '0.5em 1em',
    ':hover': {
      backgroundColor: primaryHoverBg,
      borderColor: primaryHoverBorder,
      color: primaryHoverText
    },
    ':focus': {
      backgroundColor: primaryFocusBg,
      borderColor: primaryFocusBorder,
      color: primaryFocusText
    },
    ':active': {
      backgroundColor: primaryActiveBg,
      borderColor: primaryActiveBorder,
      color: primaryActiveText
    },
    ':disabled': {
      backgroundColor: primaryDisabledBg,
      borderColor: primaryDisabledBorder,
      color: primaryDisabledText,
      cursor: 'not-allowed'
    }
  },
  large: {
    fontSize: '1.25em'
  },
  small: {
    fontSize: '0.85em'
  },
  link: {
    backgroundColor: 'transparent',
    borderStyle: 'none',
    color: link,
    ':hover': {
      color: link,
      textDecoration: 'underline'
    },
    ':focus': {
      color: link
    },
    ':active': {
      color: link,
      textDecoration: 'underline'
    },
    ':disabled': {
      color: lightGrey,
      textDecoration: 'none',
      cursor: 'not-allowed'
    }
  },

  link16: linkStyleObject16,
  link18: linkStyleObject18,

  linkInline: {
    display: 'inline',
    textAlign: 'left'
  },

  primaryButton: primaryButtonStyleObject({fill: text, stroke: white}, {fill: black, text: white}),
  secondaryButton: secondaryButtonStyleObject(text, black),
});
