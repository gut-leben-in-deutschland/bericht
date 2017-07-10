import PropTypes from 'prop-types';
import React, { Component } from 'react';

import {NarrowContainer} from 'components/Grid/Grid';
import {Menu} from 'components/LandingPage/Mobile/Menu';

import {shallowEqual} from 'utils/shallowEqual';
import {measure, passiveEvent} from 'utils/dom';


export class MobileTableOfContents extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewportHeight: 0,
      bottom: Infinity,
    };

    this.ref = measure((ref, {bottom}) => {
      this.root = ref;
      const viewportHeight = window.innerHeight;
      this.setState({bottom, viewportHeight});
    });

    this.onScroll = () => {
      if (this.root) {
        const {bottom} = this.root.getBoundingClientRect();
        this.setState({bottom});
      }
    };
  }

  componentDidMount() {
    this.onScroll();
    window.addEventListener('scroll', this.onScroll, passiveEvent());
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.state, nextState);
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  render() {
    const {t} = this.props;
    const {viewportHeight, bottom} = this.state;

    const menuStageIndex = viewportHeight < bottom ? 0 : 1;

    return (
      <NarrowContainer>
        <div ref={this.ref}>
          <Menu t={t} stageIndex={menuStageIndex} />
        </div>
      </NarrowContainer>
    );
  }
}

MobileTableOfContents.propTypes = {
  t: PropTypes.func.isRequired,
};
