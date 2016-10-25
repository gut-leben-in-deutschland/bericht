import React, {PropTypes, Component} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {connect} from 'react-redux';

import {sansRegular12, sansRegular26} from 'theme/typeface';
import {white, text, midGrey, lightGrey, beige} from 'theme/constants';

import AdultIcon from 'components/Flagship/Icons/Adult.icon.svg';
import ChildIcon from 'components/Flagship/Icons/Child.icon.svg';
import MinusIcon from 'components/Flagship/Icons/Minus.icon.svg';
import PlusIcon from 'components/Flagship/Icons/Plus.icon.svg';

import {setNumAdults, setNumChildren} from 'state/actions/flagship';


const styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },

  personKind: {
    display: 'flex',
    flexDirection: 'column',
    width: 'calc(50% - 10px)',
  },
  illustration: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  personKindLabel: {
    ...sansRegular12,
    color: midGrey,
    marginBottom: 4,
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    height: 48,
    borderRadius: 2,
    border: `1px solid ${lightGrey}`,
    backgroundColor: white,
  },
  value: {
    ...sansRegular26,
    color: text,

    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    userSelect: 'none',
  },
  inputButton: {
    display: 'block',
    width: 31,
    padding: '0 10px',
    marginLeft: 2,
    backgroundColor: beige,
    cursor: 'pointer',
    userSelect: 'none',
    textAlign: 'center',

    outline: 'none',
    border: 'none',

    ':hover': {
      backgroundColor: '#d1d1cb'
    },
  },
});


function PersonKind({illustration, label, value, decrement, increment}) { // eslint-disable-line
  return (
    <div className={css(styles.personKind)}>
      <div className={css(styles.illustration)}>
        {illustration}
      </div>

      <label className={css(styles.personKindLabel)}>
        {label}
      </label>

      <div className={css(styles.inputContainer)}>
        <div className={css(styles.value)}>{value}</div>
        <button className={css(styles.inputButton)} onClick={decrement}><MinusIcon /></button>
        <button className={css(styles.inputButton)} onClick={increment}><PlusIcon /></button>
      </div>
    </div>
  );
}


class FamilySize extends Component {
  constructor(props) {
    super(props);

    this.decrementNumAdults = () => {
      this.props.setNumAdults(this.props.numAdults - 1);
    };
    this.incrementNumAdults = () => {
      this.props.setNumAdults(this.props.numAdults + 1);
    };
    this.decrementNumChildren = () => {
      this.props.setNumChildren(this.props.numChildren - 1);
    };
    this.incrementNumChildren = () => {
      this.props.setNumChildren(this.props.numChildren + 1);
    };
  }

  render() {
    const {t, numAdults, numChildren} = this.props;

    return (
      <div className={css(styles.root)}>
        <PersonKind illustration={<AdultIcon />}
          label={t('flagship/family-size/adults')} value={numAdults}
          decrement={this.decrementNumAdults} increment={this.incrementNumAdults} />
        <PersonKind illustration={<ChildIcon />}
          label={t('flagship/family-size/children')} value={numChildren}
          decrement={this.decrementNumChildren} increment={this.incrementNumChildren} />
      </div>
    );
  }
}

FamilySize.propTypes = {
  t: PropTypes.func.isRequired,

  // Redux (mapStateToProps)
  numAdults: PropTypes.number.isRequired,
  numChildren: PropTypes.number.isRequired,

  // Redux (mapDispatchToProps)
  setNumAdults: PropTypes.func.isRequired,
  setNumChildren: PropTypes.func.isRequired,
};

export default connect(
  (state) => ({
    numAdults: state.flagship.get('numAdults'),
    numChildren: state.flagship.get('numChildren'),
  }),
  {setNumAdults, setNumChildren}
)(FamilySize);
