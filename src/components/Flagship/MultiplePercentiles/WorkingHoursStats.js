import PropTypes from 'prop-types';
import React from 'react';

import renderMarkdown from 'components/Markdown/renderMarkdown';
import {defaultReportVisitors} from 'components/Report/ReportPageComponents';
import replaceText from 'components/Markdown/replaceText';

import {getFormat} from 'components/Chart/utils';


const WorkingHoursStats = ({node, t, desiredWorkingHours, actualWorkingHours}) => {
  if (desiredWorkingHours === undefined || actualWorkingHours === undefined) {
    return null;
  }

  const diff = actualWorkingHours - desiredWorkingHours;

  const {children} = replaceText(node, {
    diff: getFormat(',.1f', t)(Math.abs(diff)),
    overOrUnder: diff >= 0 ? t('flagship/working-hours/over') : t('flagship/working-hours/under'),
  });

  return (
    <div style={{marginTop: 12}}>
      {renderMarkdown({type: 'root', children}, {visitors: defaultReportVisitors(t)})}
    </div>
  );
};

WorkingHoursStats.propTypes = {
  node: PropTypes.object.isRequired,

  t: PropTypes.func.isRequired,

  desiredWorkingHours: PropTypes.number,
  actualWorkingHours: PropTypes.number,
};

export default WorkingHoursStats;
