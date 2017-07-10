import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import {midGrey} from 'theme/constants';
import {sansRegular14} from 'theme/typeface';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  animation: {
    animationName: {
      '0%': {
        transform: `rotate(0deg)`,
      },
      '100%': {
        transform: `rotate(360deg)`,
      },
    },
    // animationTimingFunction: 'steps(12, end)',
    animationTimingFunction: 'linear',
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    width: 38,
    height: 38
  },
  label: {
    ...sansRegular14,
    color: midGrey,
    marginTop: 8
  }
});

const LoadingAnimation = () => (
  <div className={css(styles.animation)}>
    <svg width='38px' height='38px' viewBox='0 0 38 38' role='presentation'>
      <g transform=''>
        <rect fill='#F2BF18' x='17' y='0' width='4' height='12' rx='2'></rect>
        <rect fill='#0778A5' x='17' y='26' width='4' height='12' rx='2'></rect>
        <rect fill='#F28502' transform='translate(25.500000, 7.741670) rotate(30.000000) translate(-25.500000, -7.741670) ' x='23.5' y='1.74166975' width='4' height='12' rx='2'></rect>
        <rect fill='#2AAEC9' transform='translate(12.500000, 30.258330) rotate(30.000000) translate(-12.500000, -30.258330) ' x='10.5' y='24.2583302' width='4' height='12' rx='2'></rect>
        <rect fill='#C40046' transform='translate(30.258330, 12.500000) rotate(60.000000) translate(-30.258330, -12.500000) ' x='28.2583302' y='6.5' width='4' height='12' rx='2'></rect>
        <rect fill='#00857C' transform='translate(7.741670, 25.500000) rotate(60.000000) translate(-7.741670, -25.500000) ' x='5.74166975' y='19.5' width='4' height='12' rx='2'></rect>
        <rect fill='#890D48' transform='translate(32.000000, 19.000000) rotate(90.000000) translate(-32.000000, -19.000000) ' x='30' y='13' width='4' height='12' rx='2'></rect>
        <rect fill='#74B917' transform='translate(6.000000, 19.000000) rotate(90.000000) translate(-6.000000, -19.000000) ' x='4' y='13' width='4' height='12' rx='2'></rect>
        <rect fill='#8C1478' transform='translate(30.258330, 25.500000) rotate(120.000000) translate(-30.258330, -25.500000) ' x='28.2583302' y='19.5' width='4' height='12' rx='2'></rect>
        <rect fill='#4D7A3B' transform='translate(7.741670, 12.500000) rotate(120.000000) translate(-7.741670, -12.500000) ' x='5.74166975' y='6.5' width='4' height='12' rx='2'></rect>
        <rect fill='#004F80' transform='translate(25.500000, 30.258330) rotate(150.000000) translate(-25.500000, -30.258330) ' x='23.5' y='24.2583302' width='4' height='12' rx='2'></rect>
        <rect fill='#23614E' transform='translate(12.500000, 7.741670) rotate(150.000000) translate(-12.500000, -7.741670) ' x='10.5' y='1.74166975' width='4' height='12' rx='2'></rect>
      </g>
    </svg>
  </div>
);

class LoadingIndicator extends Component {
  constructor() {
    super();
    this.state = {
      visible: false
    };
  }
  componentDidMount() {
    this.timeout = setTimeout(() => this.setState({visible: true}), this.props.delay);
  }
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }
  render() {
    const {visible} = this.state;
    const {t} = this.props;
    return visible
      ? <div className={css(styles.container)}><LoadingAnimation /><div className={css(styles.label)}>{t('loading')}</div></div>
      : null;
  }
}

LoadingIndicator.propTypes = {
  t: PropTypes.func.isRequired,
  delay: PropTypes.number
};

LoadingIndicator.defaultProps = {
  delay: 500
};

export default LoadingIndicator;
