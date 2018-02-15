import PropTypes from 'prop-types';
/* eslint-disable react/no-multi-comp */

import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import {Link} from 'react-router';

import {ChevronDownIcon18} from 'components/Icons/Icons';

import {text, beige, softBeige, softGrey, midGrey} from 'theme/constants';
import {dimensionBackgroundColorStyle, dimensionBackgroundColorHoverStyle, dimensionTextColorStyle} from 'theme/colors';
import {sansRegular12, sansRegular14, serifRegular15, serifRegular26, serifBold18} from 'theme/typeface';
import {bounceDownAnimation} from 'theme/animations';

import {allDimensionIds, dimensionTitleWithHighlights, dimensionGroupTitle} from 'utils/dimension';
import {dimensionIdFromIndicatorId} from 'utils/indicator';
import {shallowEqual} from 'utils/shallowEqual';


// Card transitions have a random delay between 0 and this.
const maxTransitionDelay = 0.13;

// In at least two places we need to iterate over all the stage indexes (to
// pre-generate CSS styles).
const allStages = [1, 2, 3, 4];


function dimensionCardBaseStyle(delay = 1) {
  return {
    transitionDelay: `${delay * maxTransitionDelay}s`,
  };
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
  },

  group: {
    borderRadius: 4,
    transition: 'all .3s ',
    transitionProperty: 'top, bottom, left, right, width, height, transform, border-color, background-color',
    position: 'absolute',
  },
  groupA: {
    border: `1px solid ${softGrey}`,
    backgroundColor: softBeige,
  },
  groupB: {
    border: `1px solid ${softGrey}`,
    backgroundColor: '#F3F3F3',
  },

  groupTitle: {
    ...serifRegular26,
    color: text,
    position: 'absolute',
    transform: 'translate(-50%, 0)',
    whiteSpace: 'nowrap',
    transition: 'all .3s',
    transitionProperty: 'left, opacity',
    left: '400%',
    top: 70,
    visibility: 'hidden',
    opacity: 1,
  },

  dimensionCard: {
    ...serifRegular15,
    width: 160,
    height: 176,
    borderRadius: 4,
    padding: '24px 12px',
    textAlign: 'center',
    transition: 'all .3s',
    transitionProperty: 'top, left, bottom, right, transform, opacity',
    position: 'absolute',
    boxShadow: '0px 0px 12px 0px rgba(0,0,0,0.25)',
    whiteSpace: 'pre-wrap',
  },

  dimensionTitleHighlight: {
    ...serifBold18,
  },

  dimensionCard01: dimensionCardBaseStyle(0.5680994226546925),
  dimensionCard02: dimensionCardBaseStyle(0.6786456440836353),
  dimensionCard03: dimensionCardBaseStyle(0.35427871496074714),
  dimensionCard04: dimensionCardBaseStyle(0.2818384917419725),
  dimensionCard05: dimensionCardBaseStyle(0.941664014217177),
  dimensionCard06: dimensionCardBaseStyle(0.9937879646666892),
  dimensionCard07: dimensionCardBaseStyle(0.30426153480532236),
  dimensionCard08: dimensionCardBaseStyle(0.6155216321430139),
  dimensionCard09: dimensionCardBaseStyle(0.11425278004731876),
  dimensionCard10: dimensionCardBaseStyle(0.5726821500885624),
  dimensionCard11: dimensionCardBaseStyle(0.3883142379389406),
  dimensionCard12: dimensionCardBaseStyle(0.12613115004264563),

  centeredDimensionCard: {
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%)`,
    visibility: 'hidden',
  },

  indicatorBar: {
    position: 'absolute',
    width: '100%',
    top: '50%',
    left: '50%',
    display: 'flex',
    flexDirection: 'column',
    margin: '0 auto 6px',
    transform: 'translate(-50%, 300px)',
    zIndex: 30,
  },
  indicatorBarBoxes: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    margin: '0 auto',
  },
  indicatorBoxContainer: {
    ...sansRegular12,

    width: 20,
    height: 16,
    padding: '0 2px',
    position: 'relative',

    display: 'block',
    textDecoration: 'none',
  },
  indicatorBox: {
    width: 16,
    height: 16,
    borderRadius: 2,
    backgroundColor: beige,
  },
  indicatorBoxFaded: {
    opacity: 0.4,
  },
  interactiveIndicatorBox: {
    cursor: 'pointer',
  },
  indicatorBoxTooltip: {
    position: 'absolute',
    borderRadius: 2,
    bottom: 16,
    left: '50%',
    transform: 'translate(-50%, -20px)',
    padding: '8px 12px',
    zIndex: 100,
    textAlign: 'center',
    boxShadow: '0px 0px 12px 0px rgba(0,0,0,0.25)',
  },
  indicatorBoxTooltipArrow: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translate(-50%, 8px) rotate(45deg)',
    zIndex: 99,
    width: 16,
    height: 16,
  },
  indicatorBarLabel: {
    ...sansRegular14,
    color: midGrey,
    textAlign: 'center',
    marginTop: 4,
  },

  downArrow: {
    ...bounceDownAnimation(),

    position: 'absolute',
    opacity: 0,
    transition: 'opacity .2s, transform .5s, right 0.2s',
    bottom: 4,
    right: '50%',
  },
});

function cardPosition(dimensionId, dx, dy) {
  const hover = {
    cursor: 'pointer',
    boxShadow: '0px 0px 20px 0px rgba(0,0,0,0.35)',
    transform: `translate(${dx}px,${dy - 6}px) scale(1.02)`,
  };

  return {
    [`dimensionCard${dimensionId}`]: {
      top: '50%',
      left: '50%',
      transform: `translate(${dx}px,${dy}px)`,

      opacity: 1,

      ':hover': hover,
    },
    [`dimensionCard${dimensionId}Highlight`]: hover,
  };
}

function cardPositionOffscreen(y) {
  return {
    top: '50%',
    left: '100%',
    transform: `translate(-100%, ${y}px)`,
    opacity: 0,
  };
}

function cardPositionSpread(left, top, dx, dy, deg) {
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(${dx}%, ${dy}%) rotate(${deg}deg)`,
  };
}

const stageStyles = {
  [1]: StyleSheet.create({
    groupA: {
      backgroundColor: '#F3F3F3',
      width: 374,
      height: 400,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
    groupB: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      width: '100%',
      height: '100%',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },

    groupTitleA: {
      left: '50%',
      visibility: 'visible',
    },

    ...cardPosition('01', -130, -250),
    ...cardPosition('02', 10, -150),
    ...cardPosition('03', -170, -140),
    ...cardPosition('04', -40, -35),
    ...cardPosition('05', -130, 50),

    dimensionCard06: cardPositionOffscreen(-400),
    dimensionCard07: cardPositionOffscreen(-80),
    dimensionCard08: cardPositionOffscreen(200),

    dimensionCard09: cardPositionOffscreen(-40),
    dimensionCard10: cardPositionOffscreen(20),
    dimensionCard11: cardPositionOffscreen(45),
    dimensionCard12: cardPositionOffscreen(120),

    downArrow: {
      opacity: 1,
    },
  }),
  [2]: StyleSheet.create({
    groupA: {
      backgroundColor: '#F6F6F6',
      width: 374,
      height: 400,
      top: '50%',
      left: '50%',
      transform: 'translate(-320px, -50%)',
    },
    groupB: {
      backgroundColor: '#F3F3F3',
      width: 684,
      height: 520,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },

    groupTitleA: {
      left: 'calc(50% - 160px)',
      visibility: 'visible',
    },
    groupTitleB: {
      left: 'calc(50% + 160px)',
      visibility: 'visible',
    },

    ...cardPosition('01', -130 - 135, -250),
    ...cardPosition('02', 10 - 135, -150),
    ...cardPosition('03', -170 - 135, -140),
    ...cardPosition('04', -40 - 135, -35),
    ...cardPosition('05', -130 - 135, 50),

    ...cardPosition('06', 90, -230),
    ...cardPosition('07', 150, -95),
    ...cardPosition('08', 75, 50),

    dimensionCard09: cardPositionOffscreen(-600),
    dimensionCard10: cardPositionOffscreen(-200),
    dimensionCard11: cardPositionOffscreen(40),
    dimensionCard12: cardPositionOffscreen(400),

    downArrow: {
      opacity: 1,
    },
  }),
  [3]: StyleSheet.create({
    groupA: {
      backgroundColor: '#F6F6F6',
      width: 374,
      height: 400,
      top: '50%',
      left: '50%',
      transform: 'translate(-480px, -50%)',
    },
    groupB: {
      backgroundColor: '#F3F3F3',
      width: 684,
      height: 520,
      top: '50%',
      left: '50%',
      transform: 'translate(-492px, -50%)',
    },

    groupTitleA: {
      left: 'calc(50% - 320px)',
      visibility: 'visible',
    },
    groupTitleB: {
      left: '50%',
      visibility: 'visible',
    },
    groupTitleC: {
      left: 'calc(50% + 320px)',
      visibility: 'visible',
    },

    ...cardPosition('01', -130 - 290, -250),
    ...cardPosition('02', 10 - 290, -150),
    ...cardPosition('03', -170 - 290, -140),
    ...cardPosition('04', -40 - 290, -35),
    ...cardPosition('05', -130 - 290, 50),

    ...cardPosition('06', 90 - 160, -230),
    ...cardPosition('07', 150 - 160, -95),
    ...cardPosition('08', 75 - 160, 50),

    ...cardPosition('09', 230, -250),
    ...cardPosition('10', 300, -130),
    ...cardPosition('11', 240, -30),
    ...cardPosition('12', 210, 100),

    downArrow: {
      ...bounceDownAnimation(),
      opacity: 1,
    },
  }),
  [4]: StyleSheet.create({
    groupA: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      width: '100%',
      height: '100%',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
    groupB: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      width: '100%',
      height: '100%',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },

    groupTitleA: {
      opacity: 0,
      left: '0%',
    },
    groupTitleB: {
      opacity: 0,
      left: '50%',
    },
    groupTitleC: {
      opacity: 0,
      left: '50%',
    },

    dimensionCard01: cardPositionSpread(0, 0, 4, -5, -8),
    dimensionCard02: cardPositionSpread(0, 10, 20, 0, -15),
    dimensionCard03: cardPositionSpread(0, 30, 0, 0, -4),
    dimensionCard04: cardPositionSpread(0, 70, 20, 0, 2),
    dimensionCard05: cardPositionSpread(10, 100, 0, -50, 4),

    dimensionCard06: cardPositionSpread(30, 0, -50, -10, -10),
    dimensionCard07: cardPositionSpread(60, 0, -50, 5, 1),
    dimensionCard08: cardPositionSpread(70, 100, -50, -80, 10),

    dimensionCard09: cardPositionSpread(100, 0, -100, 20, 10),
    dimensionCard10: cardPositionSpread(100, 40, -120, 0, 3),
    dimensionCard11: cardPositionSpread(100, 50, -80, 0, -20),
    dimensionCard12: cardPositionSpread(100, 80, -95, 0, -16),
  }),
};

export class DesktopLandingPageVisualization extends Component {
  constructor(props) {
    super(props);

    // Pre-generate styles for all stages.
    allStages.forEach(stageIndex => {
      this.style(stageIndex);

      ['Top', 'Sticky', 'Bottom'].forEach(vis => {
        this.downArrowClassName(vis, stageIndex);
      });
    });
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  style(stageIndex) {
    return {
      root: css(styles.root),

      groupA: css(styles.group, styles.groupA, stageStyles[stageIndex].groupA),
      groupB: css(styles.group, styles.groupB, stageStyles[stageIndex].groupB),

      groupTitleA: css(styles.groupTitle, styles.groupTitleA, stageStyles[stageIndex].groupTitleA),
      groupTitleB: css(styles.groupTitle, styles.groupTitleB, stageStyles[stageIndex].groupTitleB),
      groupTitleC: css(styles.groupTitle, styles.groupTitleC, stageStyles[stageIndex].groupTitleC),

      indicatorBar: css(styles.indicatorBar),
      indicatorBarBoxes: css(styles.indicatorBarBoxes),
      indicatorBarLabel: css(styles.indicatorBarLabel),
    };
  }

  downArrowClassName(vis, stageIndex) {
    return css(styles.downArrow, (vis === 'Sticky') ? stageStyles[stageIndex].downArrow : undefined);
  }

  render() {
    const {t, vis, stageIndex, dimensions, indicators, hoverDimension,
      selectDimension, selectedDimensionId, hoverIndicator,
      hoverIndicatorId, originalStageIndex} = this.props;

    const style = this.style(stageIndex);

    const highlightDimensionId = dimensionIdFromIndicatorId(indicators, hoverIndicatorId);
    const hoverDimensionId = this.props.hoverDimensionId || highlightDimensionId;

    return (
      <div className={style.root}>
        <div className={style.groupB}></div>
        <div className={style.groupA}></div>

        <div className={style.groupTitleA}>{dimensionGroupTitle(dimensions, '1')}</div>
        <div className={style.groupTitleB}>{dimensionGroupTitle(dimensions, '2')}</div>
        <div className={style.groupTitleC}>{dimensionGroupTitle(dimensions, '3')}</div>

        {allDimensionIds.map(dimensionId => {
          return (
            <DimensionCard
              key={dimensionId}
              stageIndex={stageIndex}
              originalStageIndex={originalStageIndex}
              dimensions={dimensions}
              dimensionId={dimensionId}
              hoverDimension={hoverDimension}
              selectDimension={selectDimension}
              selectedDimensionId={selectedDimensionId}
              highlight={highlightDimensionId === dimensionId}
            />
          );
        })}

        <div style={{visibility: stageIndex === 3 ? 'visible' : 'hidden'}}>
          <div className={style.indicatorBar}>
            <div className={style.indicatorBarBoxes}>
              {indicators.map(indicator =>
                <IndicatorBarBox
                  key={indicator.id}
                  t={t}
                  indicator={indicator}
                  highlightBackgroundColor={hoverDimensionId === indicator.dimension_id}
                  hoverIndicator={hoverIndicator}
                  showTooltip={hoverIndicatorId === indicator.id}
                  fadedHighlight={hoverIndicatorId !== undefined && hoverIndicatorId !== indicator.id} />
              )}
            </div>
            <div className={style.indicatorBarLabel}>
              {t('landing-page/indicator-bar/label')}
            </div>
          </div>
        </div>

        <div className={this.downArrowClassName(vis, stageIndex)}>
          <ChevronDownIcon18 color={text} />
        </div>
      </div>
    );
  }
}

DesktopLandingPageVisualization.propTypes = {
  t: PropTypes.any.isRequired,
  vis: PropTypes.any.isRequired,
  stageIndex: PropTypes.any.isRequired,
  originalStageIndex: PropTypes.any.isRequired,
  dimensions: PropTypes.any.isRequired,
  indicators: PropTypes.any.isRequired,
  hoverDimensionId: PropTypes.any,
  hoverDimension: PropTypes.any.isRequired,
  selectDimension: PropTypes.any.isRequired,
  selectedDimensionId: PropTypes.any,
  hoverIndicator: PropTypes.any.isRequired,
  hoverIndicatorId: PropTypes.any,
};

function dimensionCardVisibleInStage(dimensionId, stageIndex) {
  switch (dimensionId) {
  case '01':
  case '02':
  case '03':
  case '04':
  case '05':
    return stageIndex >= 1;

  case '06':
  case '07':
  case '08':
    return stageIndex >= 2;

  case '09':
  case '10':
  case '11':
  case '12':
    return stageIndex >= 3;

  default:
    return false;
  }
}


class DimensionCard extends Component {
  constructor(props) {
    super(props);

    // Pre-generate styles for all stages.
    allStages.forEach(stageIndex => {
      allDimensionIds.forEach(dimensionId => {
        [true, false].forEach(isHighlighted => {
          [true, false].forEach(isSelectedDimension => {
            this.className(stageIndex, dimensionId, isHighlighted,
              isSelectedDimension);
          });
        });
      });
    });
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  className(stageIndex, dimensionId, isHighlighted, isSelectedDimension) {
    return css(
      styles.dimensionCard,
      dimensionTextColorStyle(dimensionId),
      dimensionBackgroundColorStyle(dimensionId),
      styles[`dimensionCard${dimensionId}`],
      isHighlighted && styles[`dimensionCard${dimensionId}Highlight`],
      stageStyles[stageIndex].dimensionCard,
      stageStyles[stageIndex][`dimensionCard${dimensionId}`],
      isHighlighted && stageStyles[stageIndex][`dimensionCard${dimensionId}Highlight`],
      isSelectedDimension && styles.centeredDimensionCard);
  }

  render() {
    const {stageIndex, originalStageIndex, dimensions, dimensionId, hoverDimension,
      selectDimension, highlight, selectedDimensionId} = this.props;

    const opacity = dimensionCardVisibleInStage(dimensionId, originalStageIndex)
      ? 1
      : 0;

    return (
      <div className={this.className(stageIndex, dimensionId, highlight, dimensionId === selectedDimensionId)}
        role='button'
        onClick={() => { selectDimension(dimensionId); }}
        onMouseEnter={() => { hoverDimension(dimensionId); }}
        onMouseLeave={() => { hoverDimension(undefined); }}
        style={{opacity}}>
        {dimensionTitleWithHighlights(dimensions, dimensionId, css(styles.dimensionTitleHighlight))}
      </div>
    );
  }
}

DimensionCard.propTypes = {
  stageIndex: PropTypes.any.isRequired,
  originalStageIndex: PropTypes.any.isRequired,
  dimensions: PropTypes.any.isRequired,
  dimensionId: PropTypes.any,
  hoverDimension: PropTypes.any.isRequired,
  selectDimension: PropTypes.any.isRequired,
  selectedDimensionId: PropTypes.any,
  highlight: PropTypes.any.isRequired,
};

function minWidthFromText(str) {
  const length = str.length;

  if (length < 20) {
    return 0;
  }

  if (length < 40) {
    return 100;
  }

  return 180;
}

class IndicatorBarBox extends Component {
  constructor(props) {
    super(props);

    allDimensionIds.forEach(dimensionId => {
      this.tooltipClassName(dimensionId);
      this.tooltipArrowClassName(dimensionId);

      [true, false].forEach(isInteractive => {
        [true, false].forEach(highlightBackgroundColor => {
          [true, false].forEach(fadedHighlight => {
            this.squareClassName(dimensionId, isInteractive, highlightBackgroundColor,
              fadedHighlight);
          });
        });
      });
    });

    this.onMouseEnter = () => {
      this.props.hoverIndicator(this.props.indicator.id);
    };
    this.onMouseLeave = () => {
      this.props.hoverIndicator(undefined);
    };
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  squareClassName(dimensionId, isInteractive, highlightBackgroundColor, fadedHighlight) {
    return css(
      styles.indicatorBox,
      isInteractive && styles.interactiveIndicatorBox,
      dimensionBackgroundColorHoverStyle(dimensionId),
      highlightBackgroundColor && dimensionBackgroundColorStyle(dimensionId),
      (highlightBackgroundColor && fadedHighlight) && styles.indicatorBoxFaded
    );
  }

  tooltipClassName(dimensionId) {
    return css(styles.indicatorBoxTooltip, dimensionTextColorStyle(dimensionId), dimensionBackgroundColorStyle(dimensionId));
  }

  tooltipArrowClassName(dimesionId) {
    return css(styles.indicatorBoxTooltipArrow, dimensionBackgroundColorStyle(dimesionId));
  }

  render() {
    const {t, indicator, highlightBackgroundColor, showTooltip, fadedHighlight} = this.props;
    const {id, dimension_id, title} = indicator;

    const minWidth = minWidthFromText(title);

    return (
      <Link
        to={t(`route/indicator-${id}`)}
        className={css(styles.indicatorBoxContainer)}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        title={title}>
        <div className={this.squareClassName(dimension_id, true, highlightBackgroundColor, fadedHighlight)} />
        {
          showTooltip &&
          (
            <div className={this.tooltipClassName(dimension_id)} style={{minWidth}}>
              <div className={this.tooltipArrowClassName(dimension_id)} />
              {title}
            </div>
          )
        }
      </Link>
    );
  }
}

IndicatorBarBox.propTypes = {
  t: PropTypes.func.isRequired,
  indicator: PropTypes.any.isRequired,
  highlightBackgroundColor: PropTypes.bool.isRequired,
  hoverIndicator: PropTypes.any.isRequired,
  showTooltip: PropTypes.bool.isRequired,
  fadedHighlight: PropTypes.bool.isRequired,
};
