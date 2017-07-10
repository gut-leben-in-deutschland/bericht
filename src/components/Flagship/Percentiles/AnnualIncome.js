import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import {connect} from 'react-redux';

import {getFormat} from 'components/Chart/utils';

import {sansRegular12, sansRegular18, sansBold18} from 'theme/typeface';
import {white, text, midGrey, lightGrey} from 'theme/constants';

import {setAnnualIncome} from 'state/actions/flagship';
import {mapMaybe, fromMaybe} from 'utils/maybe';


const styles = StyleSheet.create({
  label: {
    ...sansRegular12,
    color: midGrey,

    display: 'block',
    marginBottom: 4,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    ...sansBold18,
    color: text,

    backgroundColor: white,

    width: '100%',
    height: 48,
    display: 'flex',
    alignItems: 'center',
    padding: '0 40px 0 16px',
    outline: 'none',
    borderRadius: 2,

    border: `1px solid ${lightGrey}`,

    '::-ms-clear': {
      display: 'none'
    }
  },
  emptyInput: {
    ...sansRegular18,
  },
  invalidInput: {
    borderColor: 'red',
  },
  currencySymbol: {
    ...sansBold18,
    color: text,

    position: 'absolute',
    top: 0,
    right: 16,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    userSelect: 'none',
  },
});


const formatNumber = getFormat(',d');
function prettyFormat(annualIncome) {
  return fromMaybe('', mapMaybe(annualIncome, formatNumber));
}

let AnnualIncomeId = 0;
class AnnualIncome extends Component {
  constructor(props) {
    super(props);
    this.id = AnnualIncomeId++;

    this.state = {
      value: prettyFormat(this.props.annualIncome),

      // True if the input has focus.
      hasFocus: false,

      // True if the value which the input is showing was not saved into the
      // Redux store yet. This may be True even if hasFocus is False.
      isDirty: false,
    };

    this.onFocus = () => {
      this.setState({hasFocus: true}, () => {
        if (this.input) { this.input.select(); }
      });
    };
    this.onChange = ev => {
      this.setState({value: ev.target.value, isDirty: true});
    };
    this.onKeyPress = ev => {
      if (ev.key === 'Enter') {
        this.input.blur();
      }
    };
    this.onBlur = () => {
      this.setState({hasFocus: false});

      const numericString = this.state.value.replace(/\D/g, '');
      const n = parseInt(numericString, 10);

      this.props.setAnnualIncome(isNaN(n) ? undefined : n);
    };

    this.ref = ref => {
      this.input = ref;
    };
  }

  componentWillReceiveProps(nextProps) {
    // Always overwrite the current value, regardless if the user is currently
    // editing it!
    this.setState({value: prettyFormat(nextProps.annualIncome), isDirty: false});
  }

  render() {
    const {t} = this.props;
    const {value, hasFocus, isDirty} = this.state;

    return (
      <div>
        <label htmlFor={`annual-income-${this.id}`} className={css(styles.label)}>
          {t('flagship/annual-income/label')}
        </label>
        <div className={css(styles.inputContainer)}>
          <input
            ref={this.ref}
            id={`annual-income-${this.id}`}
            className={css(styles.input, isDirty && !hasFocus && value !== '' && styles.invalidInput, value === '' && styles.emptyInput)}
            autoComplete={'off'}
            value={value}
            placeholder={t('flagship/annual-income/placeholder')}
            onFocus={this.onFocus}
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            onBlur={this.onBlur} />

            {value !== '' &&
            <div className={css(styles.currencySymbol)}>€</div>
            }
        </div>
      </div>
    );
  }
}

AnnualIncome.propTypes = {
  t: PropTypes.func.isRequired,

  // Redux (mapStateToProps)
  annualIncome: PropTypes.number,

  // Redux (mapDispatchToProps)
  setAnnualIncome: PropTypes.func.isRequired,
};

export default connect(
  (state) => ({
    annualIncome: state.flagship.get('annualIncome'),
  }),
  {setAnnualIncome}
)(AnnualIncome);
