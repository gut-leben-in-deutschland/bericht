import React, {Component, PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {Link} from 'react-router';

import {Container} from 'components/Grid/Grid';
import {ChevronLeftIcon12} from 'components/Icons/Icons';

import {sansRegular14} from 'theme/typeface';
import {text, midGrey, softGrey, white} from 'theme/constants';
import {zIndexSticky} from 'theme/zIndex';
import {passiveEvent} from 'utils/dom';

const HEIGHT = 48;
const BOTTOM_BORDER_WIDTH = 1;

const styles = StyleSheet.create({
  root: {
    // The height of the 'root' must be the same as the height of the
    // 'outerContainer'. The later contains a bottom border, so we must add the
    // border width to the root height so that the two heights are equal.
    height: HEIGHT + BOTTOM_BORDER_WIDTH
  },
  outerContainer: {
    backgroundColor: white,
    borderBottom: `${BOTTOM_BORDER_WIDTH}px solid ${softGrey}`,

    // react-router Link reset / overrides
    textDecoration: 'none',
    display: 'block'
  },
  sticky: {
    zIndex: zIndexSticky,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0.95
  },
  innerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: HEIGHT
  },
  label: {
    ...sansRegular14,
    margin: 'auto',
    paddingLeft: 12,
    color: midGrey,

    whiteSpace: 'pre',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
});


export class StickyNavBar extends Component {
  constructor(props) {
    super(props);

    this.ref = undefined;
    this.state = {isSticky: false};

    this.onScroll = () => {
      const isSticky = this.ref !== undefined && this.ref.getBoundingClientRect().top < 0;
      if (this.state.isSticky !== isSticky) {
        this.setState({isSticky});
      }
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll, passiveEvent());
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  render() {
    const {to, label} = this.props;
    const {isSticky} = this.state;

    return (
      <div ref={ref => { this.ref = ref; }} className={css(styles.root)}>
        <Link to={to} className={css(styles.outerContainer, isSticky ? styles.sticky : undefined)}>
          <Container>
            <div className={css(styles.innerContainer)}>
              <ChevronLeftIcon12 color={text} />
              <div className={css(styles.label)}>{label}</div>
            </div>
          </Container>
        </Link>
      </div>
    );
  }
}

StickyNavBar.propTypes = {
  // Passed to react-router <Link to={..} />
  to: PropTypes.string.isRequired,
  // The label which is shown in the center of the navbar.
  label: PropTypes.string.isRequired
};
