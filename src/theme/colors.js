import {StyleSheet} from 'aphrodite';

import {blendedPrimaryButtonStyleObject, blendedSecondaryButtonStyleObject} from 'components/ButtonLink/Styles';
import {allDimensionIds, dimensionColor, dimensionColorAlpha, dimensionTextColor} from 'utils/dimension';


// The object which is created by 'dimensionStyles' uses 'DimensionId' as the
// key. Aphrodite takes that at face value when generating CSS selector names.
// But CSS selectors can not start with a digit. Ideally, aphrodite would
// normalize the selector names. But it does not, so to work around that we
// prefix the dimensionId with a letter.
//
// See https://github.com/Khan/aphrodite/issues/118

function toStyleKey(dimensionId) {
  return `d${dimensionId}`;
}


// Helper function which can be used to create a style object for each
// dimension. The callback is called once for each DimensionId. The function
// returns a map from DimensionId to whatever the function returns.
function dimensionStyles(f) {
  const ret = {};
  allDimensionIds.forEach(id => { ret[toStyleKey(id)] = f(id); });
  return ret;
}


// Map<DimensionId, AphroditeStyle>
const _dimensionBorderColorStyles = StyleSheet.create(
  dimensionStyles(id => ({borderColor: dimensionColor(id)}))
);
// DimensionId -> AphroditeStyle
export function dimensionBorderColorStyle(dimensionId) {
  return _dimensionBorderColorStyles[toStyleKey(dimensionId)];
}


// Map<DimensionId, AphroditeStyle>
const _dimensionBackgroundColorStyles = StyleSheet.create(
  dimensionStyles(id => ({backgroundColor: dimensionColor(id)}))
);
// DimensionId -> AphroditeStyle
export function dimensionBackgroundColorStyle(dimensionId) {
  return _dimensionBackgroundColorStyles[toStyleKey(dimensionId)];
}


// Number -> (DimensionId -> AphroditeStyle)
function dimensionBackgroundColorAlphaStyle(alpha) {
  const styles = StyleSheet.create(
    dimensionStyles(id => ({backgroundColor: dimensionColorAlpha(id, alpha)}))
  );

  return dimensionId => styles[toStyleKey(dimensionId)];
}
// DimensionId -> AphroditeStyle
export const dimensionBackgroundColorAlpha20Style
  = dimensionBackgroundColorAlphaStyle(0.2);


// Map<DimensionId, AphroditeStyle>
const _dimensionTextColorStyles = StyleSheet.create(
  dimensionStyles(id => ({color: dimensionTextColor(id)}))
);
// DimensionId -> AphroditeStyle
export function dimensionTextColorStyle(dimensionId) {
  return _dimensionTextColorStyles[toStyleKey(dimensionId)];
}


// Map<DimensionId, AphroditeStyle>
const _dimensionBackgroundColorHoverStyles = StyleSheet.create(
  dimensionStyles(id => ({':hover': {backgroundColor: dimensionColor(id)}}))
);
// DimensionId -> AphroditeStyle
export function dimensionBackgroundColorHoverStyle(dimensionId) {
  return _dimensionBackgroundColorHoverStyles[toStyleKey(dimensionId)];
}


// Map<DimensionId, AphroditeStyle>
const _primaryDimensionButtonStyles = StyleSheet.create(
  dimensionStyles(id => blendedPrimaryButtonStyleObject(dimensionTextColor(id), dimensionColor(id)))
);
// DimensionId -> AphroditeStyle
export function primaryDimensionButtonStyle(dimensionId) {
  return _primaryDimensionButtonStyles[toStyleKey(dimensionId)];
}


// Map<DimensionId, AphroditeStyle>
const _secondaryDimensionButtonStyles = StyleSheet.create(
  dimensionStyles(id => blendedSecondaryButtonStyleObject(dimensionTextColor(id), dimensionTextColor(id)))
);
// DimensionId -> AphroditeStyle
export function secondaryDimensionButtonStyle(dimensionId) {
  return _secondaryDimensionButtonStyles[toStyleKey(dimensionId)];
}
