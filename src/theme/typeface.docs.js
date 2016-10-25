import React from 'react';
import {StyleSheet, css} from 'aphrodite';
import {Page, Span} from 'catalog';

import {midGrey} from 'theme/constants';
import * as TF from 'theme/typeface';


const styles = StyleSheet.create({
  typeface: {
    background: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 130,
    width: '100%',
    marginBottom: 20,
    padding: 10
  },
  heading: {
    ...(TF.sansRegular16),
    marginBottom: 12,
    color: midGrey
  }
});

export default () => (
  <Page>
    {Object.keys(TF).map(n => {
      const style = StyleSheet.create({style: {
        ...TF[n]
      }}).style;

      return (
        <Span key={n} span={3}>
          <div className={css(styles.typeface)}>
            <div className={css(styles.heading)}>{n}</div>
            <div className={css(style)}>The quick brown fox jumps over the lazy dog</div>
          </div>
        </Span>
      );
    })}
  </Page>
);
