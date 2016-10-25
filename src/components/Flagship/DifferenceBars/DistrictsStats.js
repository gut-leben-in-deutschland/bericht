import {PropTypes} from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import renderMarkdown from 'components/Markdown/renderMarkdown';
import {defaultReportVisitors} from 'components/Report/ReportPageComponents';
import replaceText from 'components/Markdown/replaceText';

const DistrictsStats = ({t, userLocation, geoData, node, data, endYear, numberFormat}) => {
  if (!userLocation || !geoData.geoJson) return null;

  const userDistrictId = geoData.agsMapper(userLocation.get('id'));
  const userDistrictIdIntString = String(+userDistrictId);
  const datum = data.find(d => d.krs === userDistrictIdIntString && d.year === endYear);

  const {children} = replaceText(node, {
    municipality: userLocation.get('name'),
    district: geoData.name(userDistrictId),
    value: datum ? numberFormat(datum.value) : 'n/A'
  });

  return renderMarkdown({type: 'root', children}, {visitors: defaultReportVisitors(t)});
};

DistrictsStats.propTypes = {
  t: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  endYear: PropTypes.string.isRequired,
  numberFormat: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired,
  userLocation: ImmutablePropTypes.map,
  userDistrictId: PropTypes.string,
  geoData: PropTypes.shape({
    agsMapper: PropTypes.func.isRequired,
    name: PropTypes.func.isRequired
  })
};

export default DistrictsStats;
