import React, {PropTypes, Component} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {ascending} from 'd3-array';

import SearchIcon from 'components/Icons/Search.icon.svg';
import Select from 'components/Select/Select';
import {setLocation} from 'state/actions/flagship';

import {sansRegular15, sansRegular18} from 'theme/typeface';
import {text, softGrey, softBeige} from 'theme/constants';

import municipalitiesUrl from '!!file!data/municipalities.csv';
import {DATA_STATUS_REQUESTED} from 'state/reducers/data';
import {loadData as loadDataAction} from 'state/actions/data';


const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: softBeige,
    marginBottom: 30
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
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  placeholderText: {
    ...sansRegular15,
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

    minHeight: 48,
    padding: '16px 0',

    textDecoration: 'none',
  },
});

export const optionsSelector = createSelector(
  state => state.data.getIn([municipalitiesUrl, 'data']),
  data => (data || []).map(municipality => ({
    value: municipality.id,
    label: municipality.name,
    municipality
  })).sort((a, b) => ascending(a.label, b.label))
);

export function optionRenderer({value, label}) { // eslint-disable-line
  return (
    <div className={css(styles.optionContainer)}>{label}</div>
  );
}


class LocationSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      input: '',
      active: false,
    };

    this.onFocus = () => {
      this.props.loadData(municipalitiesUrl);
      this.setState({active: true});
    };
    this.onBlur = () => {
      this.setState({active: false});
    };

    this.onInputChange = input => {
      this.setState({input});
    };

    this.onChange = option => {
      this.setState({input: '', active: false});
      this.props.onChange(option, this.props.options);
    };
  }

  render() {
    const {options, isLoading, t, label, ...props} = this.props;
    const {input, active} = this.state;

    const hasMinInput = input.length >= 3;

    const placeholder = props.value
      ? <span style={{color: text}}>{label}</span>
      : '';

    const noResultsText = hasMinInput
      ? t('flagship/location-select/no-result')
      : t('flagship/location-select/minimum-input');

    return (
      <div className={css(styles.outerContainer, active && styles.activeOuterContainer)}>
        <div className={css(styles.container)}>
          {<ActiveSearchIcon />}
          <Select {...props}
            inputProps={{title: t('flagship/location-select/title')}}
            matchPos='start'
            matchProp='label'
            placeholder={placeholder}
            searchingText={t('flagship/location-select/loading')}
            options={hasMinInput ? options : []}
            isLoading={hasMinInput ? isLoading : false}
            onInputChange={this.onInputChange}
            onChange={this.onChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            optionRenderer={optionRenderer}
            noResultsText={noResultsText} />
        </div>
      </div>
    );
  }
}

LocationSelect.propTypes = {
  loadData: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  label: PropTypes.string,
  t: PropTypes.func.isRequired
};

export default connect(
  (state) => ({
    options: optionsSelector(state),
    value: state.flagship.getIn(['location', 'id']),
    label: state.flagship.getIn(['location', 'name']),
    isLoading: state.data.getIn([municipalitiesUrl, 'status']) === DATA_STATUS_REQUESTED
  }),
  {
    loadData: loadDataAction,
    onChange: (option, options) => {
      let municipality = null;
      if (option) {
        municipality = option.municipality;
        if (municipality.no2Ags) {
          municipality = {
            ...municipality,
            no2Municipality: options
              .find(o => o.value === municipality.no2Ags)
              .municipality
          };
        }
      }
      return setLocation(municipality);
    }
  }
)(LocationSelect);

function Placeholder({t}) { // eslint-disable-line
  return (
    <div className={css(styles.placeholder)}>
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
