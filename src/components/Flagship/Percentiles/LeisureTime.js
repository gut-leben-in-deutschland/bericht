import React, {PropTypes, Component} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {connect} from 'react-redux';

import {getFormat} from 'components/Chart/utils';

import {sansRegular12, sansRegular18, sansBold18} from 'theme/typeface';
import {white, text, midGrey, lightGrey} from 'theme/constants';

import {setLeisureTime} from 'state/actions/flagship';
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


const formatNumber = getFormat('');
function prettyFormat(leisureTime) {
  return fromMaybe('', mapMaybe(leisureTime, formatNumber));
}

let LeisureTimeId = 0;
class LeisureTime extends Component {
  constructor(props) {
    super(props);
    this.id = LeisureTimeId++;

    this.state = {
      value: prettyFormat(this.props.leisureTime),

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

      const n = parseFloat(this.state.value.replace(/(,|\.)/, '.'));
      this.props.setLeisureTime(isNaN(n) ? undefined : n);
    };

    this.ref = ref => {
      this.input = ref;
    };
  }

  componentWillReceiveProps(nextProps) {
    // Always overwrite the current value, regardless if the user is currently
    // editing it!
    this.setState({value: prettyFormat(nextProps.leisureTime), isDirty: false});
  }

  render() {
    const {t} = this.props;
    const {value, hasFocus, isDirty} = this.state;

    return (
      <div>
        <label htmlFor={`leisure-time-${this.id}`} className={css(styles.label)}>
          {t('flagship/leisure-time/label')}
        </label>
        <div className={css(styles.inputContainer)}>
          <input
            ref={this.ref}
            id={`leisure-time-${this.id}`}
            className={css(styles.input, isDirty && !hasFocus && value !== '' && styles.invalidInput, value === '' && styles.emptyInput)}
            autoComplete={'off'}
            value={value}
            placeholder={t('flagship/leisure-time/placeholder')}
            onFocus={this.onFocus}
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            onBlur={this.onBlur} />

          {value !== '' &&
          <div className={css(styles.currencySymbol)}>{t('flagship/leisure-time/minutes')}</div>
          }
        </div>
      </div>
    );
  }
}

LeisureTime.propTypes = {
  t: PropTypes.func.isRequired,

  // Redux (mapStateToProps)
  leisureTime: PropTypes.number,

  // Redux (mapDispatchToProps)
  setLeisureTime: PropTypes.func.isRequired,
};

export default connect(
  (state) => ({
    leisureTime: state.flagship.get('leisureTime'),
  }),
  {setLeisureTime}
)(LeisureTime);
