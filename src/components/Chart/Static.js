import React, {PropTypes} from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

const Charts = require.context('./Static/', false, /\.svg$/);
const AvailableCharts = Charts.keys();
const ChartKey = (id, size, locale) => {
  if (size === 'mini') {
    return `./${id}-mini.chart.svg`;
  }
  return `./${id}-${size}.${locale}.chart.svg`;
};

const Static = (props) => {
  const {
    width,
    mini,
    children,
    locale,
    id
  } = props;

  let size = width >= 610 ? 'l' : 's';
  if (mini) {
    size = 'mini';
  }
  let scale;
  if (size === 's') {
    scale = AvailableCharts.indexOf(ChartKey(id, size, locale)) === -1;
    if (scale) {
      size = 'l';
    }
  }

  const Chart = Charts(ChartKey(id, size, locale));
  const Element = (<Chart width={(scale || mini) ? width : undefined} style={{
    display: 'block',
    margin: '0 auto'
  }} />);

  return (
    <div>
      {Element}
      <div>
        {children}
      </div>
    </div>
  );
};

Static.propTypes = {
  children: PropTypes.node,
  values: ImmutablePropTypes.list.isRequired,
  width: PropTypes.number.isRequired,
  mini: PropTypes.bool,
  locale: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  description: PropTypes.string,
  id: PropTypes.string.isRequired
};

Static.defaultProps = {
};

export default Static;
