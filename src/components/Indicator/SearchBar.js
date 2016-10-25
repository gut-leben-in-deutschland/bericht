import React, {PropTypes, Component} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {Link, withRouter} from 'react-router';

import SearchIcon from 'components/Icons/Search.icon.svg';
import Select from 'components/Select/Select';

import {sansRegular14, sansRegular15, sansRegular18, sansBold18} from 'theme/typeface';
import {text, midGrey, softGrey, softBeige} from 'theme/constants';

import {getOptions, filterFactory} from 'utils/indicatorSearch';
import {highlight} from 'utils/highlight';
import {hyphenate} from 'utils/hyphenate';


const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: softBeige,
  },

  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    width: '100%',
    position: 'relative',
  },

  placeholder: {
    width: '100%',
    height: '100%',

    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    ...sansRegular15,
    color: midGrey,

    paddingLeft: 8,
  },
  focusPlaceholder: {
    width: '100%',
    height: '100%',

    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  focusPlaceholderText: {
    ...sansRegular18,
    color: softGrey,
  },

  activeSearchIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 40,
    zIndex: 1,

    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionContainer: {
    ...sansRegular18,
    color: text,

    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',

    minHeight: 64,
    padding: '20px 0',

    textDecoration: 'none',
  },
  optionTitle: {
    flexGrow: 1,
  },
  highlight: {
    ...sansBold18,
  },
  subLabel: {
    ...sansRegular14,
    color: midGrey,
    marginLeft: 40,
    flexShrink: 0,
  },
});

export function optionRenderer(locale, searchText) {
  return ({label, value: {location, subLabel}}) => ( // eslint-disable-line
    <Link to={location} className={css(styles.optionContainer)}>
      <div className={css(styles.optionTitle)}>{highlight(hyphenate(locale, label || ''), `(${searchText})`, css(styles.highlight))}</div>
      <div className={css(styles.subLabel)}>{subLabel}</div>
    </Link>
  );
}

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value !== undefined ? props.value : '',
      active: false,
    };

    this.onFocus = () => {
      if (document.body.clientWidth <= 640) {
        const {router, t} = this.props;
        router.push(t('route/dashboard-search'));
      } else {
        this.setState({active: true});
      }
    };
    this.onBlur = () => {
      this.setState({active: false});
    };

    this.onInputChange = value => {
      this.setState({value});
    };

    this.onChange = newValue => {
      const {router} = this.props;

      if (newValue === null) {
        router.push(this.props.t('route/dashboard'));
        this.setState({value: ''});
      } else {
        router.push(newValue.value.location);
        this.setState({value: '', active: false});
      }
    };

    // Pre-generate styles (especially those for the options).
    Object.keys(styles).forEach(k => css(styles[k]));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== undefined) {
      this.setState({value: nextProps.value});
    }
  }

  render() {
    const {locale, t, dimensions, indicators} = this.props;
    const {value, active} = this.state;

    return (
      <div ref='root' className={css(styles.outerContainer, active && styles.activeOuterContainer)}>
        <div className={css(styles.container)}>
          {(active || value !== '') && <ActiveSearchIcon />}
          <Select
            inputProps={{title: t('search-bar/title')}}
            placeholder={active ? <FocusPlaceholder t={t} /> : <Placeholder t={t} />}
            onInputChange={this.onInputChange}
            onChange={this.onChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            autosize={false}
            noResultsText={t('search-bar/no-indicator-found')}
            options={getOptions(t, dimensions, indicators, value)}
            onBlurResetsInput={false}
            optionRenderer={optionRenderer(locale, value)}
            value={value ? {value} : undefined}
            valueRenderer={() => this.state.value}
            filterOption={filterFactory(value)}
            clearable={this.state.value !== ''} />
        </div>
      </div>
    );
  }
}

SearchBar.propTypes = {
  router: PropTypes.any.isRequired,
  locale: PropTypes.string.isRequired,
  t: PropTypes.any.isRequired,
  dimensions: PropTypes.any.isRequired,
  indicators: PropTypes.any.isRequired,
  value: PropTypes.string,
};

export default withRouter(SearchBar);


function Placeholder({t}) { // eslint-disable-line
  return (
    <div className={css(styles.placeholder)}>
      <SearchIcon />
      <div className={css(styles.placeholderText)}>{t('search-bar/search')}</div>
    </div>
  );
}

function FocusPlaceholder({t}) { // eslint-disable-line
  return (
    <div className={css(styles.focusPlaceholder)}>
      <div className={css(styles.focusPlaceholderText)}>{t('search-bar/search')}</div>
    </div>
  );
}

function ActiveSearchIcon() {
  return (
    <div className={css(styles.activeSearchIcon)}>
      <SearchIcon />
    </div>
  );
}
