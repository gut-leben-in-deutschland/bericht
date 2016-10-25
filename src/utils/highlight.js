import React from 'react';


// Replace all occurences of the needle (regexp string which must contain at
// least one capturing group) with a <span> with the given class.
//
// To avoid any issues with whitespace, the parent element should use
// "white-space: pre-wrap;"
//
// Example:
//
//  <div className={css(styles.textContainer)}>
//    {highlight('foo bar baz', '(bar)', css(styles.highlight))}
//  </div>


export function highlight(str, needle, className) {
  if (needle === '()') {
    return str;
  }

  function go(needleRegExp, result) {
    const currentIndex = needleRegExp.lastIndex;
    const match = needleRegExp.exec(str);
    if (match === null) {
      return result.concat([str.substring(currentIndex)]);
    }

    return go(needleRegExp, result.concat([
      str.substring(currentIndex, match.index),
      <span key={match.index} className={className}>{match[1]}</span>
    ]));
  }

  return go(new RegExp(needle, 'gi'), []);
}
