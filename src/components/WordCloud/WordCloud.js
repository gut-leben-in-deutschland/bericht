import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {withCabinet} from 'cabinet';
import {StyleSheet, css} from 'aphrodite';

import {white, midGrey, wordcloudWordColor, marginL} from 'theme/constants';
import {sansRegular12, serifRegular12, serifRegular16, serifRegular20} from 'theme/typeface';
import {m, l} from 'theme/mediaQueries';


const styles = StyleSheet.create({
  word: {
    ...serifRegular12,
    color: white,
    backgroundColor: wordcloudWordColor,

    height: 32,
    borderRadius: 16,

    display: 'flex',
    alignItems: 'center',

    padding: '0 16px',
    margin: 4,

    whiteSpace: 'pre',

    [m]: {
      ...serifRegular16,
      height: 40,
      borderRadius: 20,

      padding: '0 18px',
      margin: 6,
    },

    [l]: {
      ...serifRegular20,
      height: 48,
      borderRadius: 24,

      padding: '0 24px',
      margin: 8,
    }
  },

  wordcloud: {
    margin: `${marginL}px 0`,

    ':last-child': {
      marginBottom: 0,
    },
  },
  words: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',

    [l]: {
      margin: `0 -${(840 - 610) / 2}px`,
    },
  },
  legend: {
    ...sansRegular12,
    color: midGrey,
    marginTop: 24,
  },
});


function Word({word}) { // eslint-disable-line
  return <div className={css(styles.word)}>{word}</div>;
}

class _WordCloud extends Component {
  render() {
    const {locale, words, legend} = this.props;

    return (
      <figure className={css(styles.wordcloud)}>
        <div className={css(styles.words)}>
          {words.map((word, index) => <Word key={index} word={word[locale]} />)}
        </div>

        {!!legend && <figcaption className={css(styles.legend)}>
          {legend}
        </figcaption>}
      </figure>
    );
  }
}

_WordCloud.propTypes = {
  locale: PropTypes.string.isRequired,
  words: PropTypes.arrayOf(PropTypes.object).isRequired,
  legend: PropTypes.string,
};

export const WordCloud = withCabinet(({wordsFile}) => ({words: wordsFile}))(_WordCloud);
