import React, {PropTypes, Component} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {connect} from 'react-redux';

import {sansRegular12, sansRegular18, sansBold18} from 'theme/typeface';
import {white, text, midGrey, lightGrey} from 'theme/constants';

import {getFormat} from 'components/Chart/utils';
import {setDesiredWorkingHours, setActualWorkingHours} from 'state/actions/flagship';


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

const hourFormat = getFormat(',.1f');
function formattedValue(workingHours) {
  if (workingHours !== undefined) {
    return hourFormat(+workingHours);
  }
  return '';
}

let WorkingHoursId = 0;
class WorkingHours extends Component {
  constructor(props) {
    super(props);
    this.id = WorkingHoursId++;

    this.state = {
      value: formattedValue(this.props.workingHours),

      // True if the input has focus.
      hasFocus: false,

      error: false,
    };

    this.onFocus = () => {
      this.setState({hasFocus: true}, () => {
        if (this.input) { this.input.select(); }
      });
    };
    this.onChange = ev => {
      this.setState({value: ev.target.value});
    };
    this.onKeyPress = ev => {
      if (ev.key === 'Enter') {
        this.input.blur();
      }
    };
    this.onBlur = () => {
      const value = this.state.value.trim();
      const n = parseFloat(value.replace(/(,|\.)/, '.'));
      this.setState({hasFocus: false, error: value.length && isNaN(n)});

      this.props.setWorkingHours(isNaN(n) ? undefined : n);
    };

    this.ref = ref => {
      this.input = ref;
    };
  }

  componentWillReceiveProps(nextProps) {
    // Always overwrite the current value, regardless if the user is currently
    // editing it!
    this.setState({value: formattedValue(nextProps.workingHours)});
  }

  render() {
    const {t} = this.props;
    const {value, hasFocus, error} = this.state;

    return (
      <div>
        <label htmlFor={`working-hours-${this.id}`} className={css(styles.label)}>
          {t(this.props.labelKey)}
        </label>
        <div className={css(styles.inputContainer)}>
          <input
            ref={this.ref}
            id={`working-hours-${this.id}`}
            className={css(
              styles.input,
              error && !hasFocus && styles.invalidInput,
              value === '' && styles.emptyInput
            )}
            autoComplete={'off'}
            value={value}
            placeholder={t('flagship/working-hours/placeholder')}
            onFocus={this.onFocus}
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            onBlur={this.onBlur} />

          {value !== '' &&
          <div className={css(styles.currencySymbol)}>{t('flagship/working-hours/unit')}</div>
          }
        </div>
      </div>
    );
  }
}

WorkingHours.propTypes = {
  t: PropTypes.func.isRequired,

  labelKey: PropTypes.string.isRequired,

  // Redux (mapStateToProps)
  workingHours: PropTypes.number,

  // Redux (mapDispatchToProps)
  setWorkingHours: PropTypes.func.isRequired,
};


export const DesiredWorkingHours = connect(
  (state) => ({
    workingHours: state.flagship.get('desiredWorkingHours'),
    labelKey: 'flagship/working-hours/desired/label',
  }),
  {setWorkingHours: setDesiredWorkingHours}
)(WorkingHours);

export const ActualWorkingHours = connect(
  (state) => ({
    workingHours: state.flagship.get('actualWorkingHours'),
    labelKey: 'flagship/working-hours/actual/label',
  }),
  {setWorkingHours: setActualWorkingHours}
)(WorkingHours);
