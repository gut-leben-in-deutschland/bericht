import {ascending} from 'd3-array';

export const getLowerAndHigher = (step, data, value) => {
  let lower = data.filter(d => +d.value < value).length * step;
  let higher = data.filter(d => +d.value > value).length * step;
  const equal = data.filter(d => +d.value === value).sort((a, b) => ascending(+a.value, +b.value));
  if (equal.length === 1) {
    lower += step;
    higher += step;
  } else if (equal.length > 1) {
    lower = +equal[0].percentile;
    higher = 100 - +equal[equal.length - 1].percentile;
  }

  return {
    lower,
    higher
  };
};
