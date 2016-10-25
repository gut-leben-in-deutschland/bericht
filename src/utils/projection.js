import {geoConicConformal} from 'd3-geo';

export const getProjection = () => geoConicConformal().parallels([48.66666666666666, 53.66666666666666]);
