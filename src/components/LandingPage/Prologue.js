import React from 'react';
import {StyleSheet, css} from 'aphrodite';

import {NarrowContainer} from 'components/Grid/Grid';

import {sansRegular20, sansRegular24} from 'theme/typeface';
import {text} from 'theme/constants';
import {m as mUp} from 'theme/mediaQueries';


const styles = StyleSheet.create({
  prologue: {
    ...sansRegular20,
    color: text,

    marginBottom: 40,

    [mUp]: {
      ...sansRegular24,
    },
  },
});

export function Prologue({children}) { // eslint-disable-line
  return (
    <NarrowContainer>
      <div className={css(styles.prologue)}>{children}</div>
    </NarrowContainer>
  );
}
