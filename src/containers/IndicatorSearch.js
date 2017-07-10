import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import {withCabinet} from 'cabinet';
import {Link, withRouter} from 'react-router';

import CloseIcon from 'components/Icons/Close';

import {white, text, softGrey, softBeige} from 'theme/constants';
import {sansRegular18, sansBold18} from 'theme/typeface';

import {getOptions, filterFactory} from 'utils/indicatorSearch';
import {highlight} from 'utils/highlight';


const styles = StyleSheet.create({
  search: {
    backgroundColor: softBeige,
    minHeight: '100vh',
  },

  searchField: {
    backgroundColor: white,
    height: 64,
    padding: '0 40px',

    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchFieldInput: {
    ...sansRegular18,
    color: text,

    outline: 'none',
    border: 'none',
    padding: 0,
    display: 'block',
    width: '100%',
    height: '100%',
  },
  searchFieldClose: {
    width: 40,
    height: 64,
    position: 'absolute',
    top: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    textDecoration: 'none',
  },

  searchResults: {
    padding: '8px 0 20px 20px',
  },

  optionContainer: {
    ...sansRegular18,
    color: text,

    minHeight: 48,
    padding: '8px 20px 8px 20px',

    display: 'block',
    textDecoration: 'none',
    whiteSpace: 'pre-wrap',

    borderBottom: `1px solid ${softGrey}`,
  },
  highlight: {
    ...sansBold18,
  },
});

class _IndicatorSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {inputValue: ''};

    this.onFocus = () => {
      clearTimeout(this.clearTimeoutId);
    };

    this.onChange = ev => {
      this.setState({inputValue: ev.target.value});
    };

    this.onBlur = () => {
      this.clearTimeoutId = setTimeout(() => {
        const {router, cabinet: {t}} = this.props;
        router.push(t('route/dashboard'));
      }, 1);
    };
  }

  componentDidMount() {
    this.refs.input.focus();
  }

  componentWillUnmount() {
    clearTimeout(this.clearTimeoutId);
  }

  render() {
    const {cabinet: {t}, dimensions, indicators} = this.props;
    const {inputValue} = this.state;

    return (
      <div className={css(styles.search)}>
        <div className={css(styles.searchField)}>
          <input ref='input' title={t('search-bar/title')}
            value={inputValue} className={css(styles.searchFieldInput)}
            onFocus={this.onFocus} onChange={this.onChange} onBlur={this.onBlur} />
          <Link to={t('route/dashboard')} className={css(styles.searchFieldClose)}>
            <CloseIcon />
          </Link>
        </div>

        <div className={css(styles.searchResults)}>
          {
            getOptions(t, dimensions, indicators, inputValue)
              .filter(filterFactory(inputValue))
              .map(({label, value: {location}}, index) => (
                <Link key={index} to={location} className={css(styles.optionContainer)}>
                  {highlight(label, `(${inputValue})`, css(styles.highlight))}
                </Link>
              ))
          }
        </div>
      </div>
    );
  }
}

_IndicatorSearch.propTypes = {
  location: PropTypes.any.isRequired,
  router: PropTypes.any.isRequired,
  route: PropTypes.object.isRequired,
  cabinet: PropTypes.object.isRequired,

  dimensions: PropTypes.array.isRequired,
  indicators: PropTypes.array.isRequired
};

const IndicatorSearch = withRouter(withCabinet(({cabinet: {locale}}) => ({
  dimensions: `dimensions.${locale}.csv`,
  indicators: `indicators.${locale}.csv`
}))(_IndicatorSearch));

export default IndicatorSearch;
