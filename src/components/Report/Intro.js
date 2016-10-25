import React, {PropTypes, Component} from 'react';
import {StyleSheet, css} from 'aphrodite';

import renderMarkdown from 'components/Markdown/renderMarkdown';
import {NarrowContainer} from 'components/Grid/Grid';
import {headerHeight} from 'components/Header/Header';
import {ChevronDownIcon16} from 'components/Icons/Icons';
import {topBarHeight} from 'components/ChapterMenu/Bar';

import {sansRegular18, serifRegular26, serifRegular48, serifRegular72} from 'theme/typeface';
import {text, marginL} from 'theme/constants';
import {onlyS, m as mUp, xl as xlUp} from 'theme/mediaQueries';
import {dimensionBackgroundColorStyle, dimensionTextColorStyle} from 'theme/colors';
import {bounceDownAnimation} from 'theme/animations';

import {dimensionTextColor} from 'utils/dimension';
import {shallowEqual} from 'utils/shallowEqual';
import {measure, scrollY, passiveEvent} from 'utils/dom';


// Must be at least 10px (arrow bottom offset) + 15px (how much the arrow
// bounces up) + 9px (height of the arrow).
const ARROW_BLOCK_HEIGHT = 48;


const styles = StyleSheet.create({
  intro: {
    marginBottom: marginL,
  },
  introContainer: {
    minHeight: 480,
    maxHeight: 800,
    height: `calc((100vh - ${headerHeight.s}px) * .7)`,

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',

    [mUp]: {
      height: `calc((100vh - ${headerHeight.mUp}px) * .7)`,
    },
    [xlUp]: {
      minHeight: 680,
      maxHeight: 960,
    },
  },

  title: {
    ...serifRegular26,
    margin: '0 0 40px',

    [mUp]: {
      ...serifRegular48,
    },
    [xlUp]: {
      ...serifRegular72,
    },
  },
  paragraph: {
    ...sansRegular18,
    margin: 0
  },

  arrowContainer: {
    display: 'block',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: ARROW_BLOCK_HEIGHT,
  },
  arrow: {
    ...bounceDownAnimation(),

    position: 'absolute',
    bottom: 10,
    left: 'calc(50% - 16px)',

    transition: 'opacity .22s',
    opacity: 0,
    fontSize: 0,
  },

  introContentInCard: {
    display: 'block',
    [onlyS]: {
      display: 'none'
    }
  },
  introContentOutsideOfCard: {
    display: 'none',
    [onlyS]: {
      color: text,
      display: 'block',
      marginTop: marginL
    }
  }
});

const IntroParagraph = (props) => <p {...props} className={css(styles.paragraph)} />;

const introVisitors = {
  paragraph: (node, index, parent, visitChildren) => <IntroParagraph key={index}>{visitChildren(node)}</IntroParagraph>,
  zone: (node, index, parent, visitChildren) => node.name === 'Prologue' ? visitChildren(node) : null,
  text: (node) => node.value,
  // Just display link references as text (e.g. [...])
  linkReference: (node) => `[${node.children[0].value}]`,
  default: () => null
};

class Intro extends Component {
  constructor(props) {
    super(props);

    this.state = {showArrow: false};

    this.containerRef = measure(ref => {
      this.container = ref;
      this.onScroll();
    });
    this.containerContentRef = measure(ref => {
      this.containerContent = ref;
      this.onScroll();
    });

    this.onScroll = () => {
      if (this.container && this.containerContent) {
        const viewportHeight = window.innerHeight;
        const containerBottom = this.container.getBoundingClientRect().bottom;
        const containerContentBottom = this.containerContent.getBoundingClientRect().bottom;

        this.setState({showArrow: containerBottom > viewportHeight && containerContentBottom < viewportHeight - ARROW_BLOCK_HEIGHT});
      }
    };

    this.scrollToContent = (ev) => {
      ev.preventDefault();
      if (this.container) {
        const {top, height} = this.container.getBoundingClientRect();
        window.scrollTo(0, scrollY() + top + height - topBarHeight);
      }
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll, passiveEvent());
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  render() {
    const {t, dimensionId, title, intro} = this.props;
    const introContent = renderMarkdown(intro, {visitors: introVisitors});

    return (
      <div className={css(styles.intro)}>
        <div ref={this.containerRef} className={css(styles.introContainer, dimensionBackgroundColorStyle(dimensionId), dimensionTextColorStyle(dimensionId))}>
          <div ref={this.containerContentRef}>
            <NarrowContainer>
              <h1 className={css(styles.title)}>{title}</h1>
              <div className={css(styles.introContentInCard)}>{introContent}</div>
            </NarrowContainer>
          </div>

          <a href='#' title={t('report/intro/scroll-down-to-content')} className={css(styles.arrowContainer)} style={{display: this.state.showArrow ? 'block' : 'none'}} onClick={this.scrollToContent}>
            <div className={css(styles.arrow)} style={{opacity: this.state.showArrow ? 1 : 0}}>
              <ChevronDownIcon16 color={dimensionTextColor(dimensionId)} />
            </div>
          </a>
        </div>
        <div className={css(styles.introContentOutsideOfCard)}>
          <NarrowContainer>{introContent}</NarrowContainer>
        </div>
      </div>
    );
  }
}

Intro.propTypes = {
  t: PropTypes.func.isRequired,
  dimensionId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  intro: PropTypes.shape({type: PropTypes.oneOf(['zone']), name: PropTypes.oneOf(['Prologue'])}).isRequired,
};

export default Intro;
