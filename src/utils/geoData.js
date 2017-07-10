import {loadData} from 'state/actions/data';
import {feature as topojsonFeature} from 'topojson';
import {createSelector} from 'reselect';
import {DATA_STATUS_REQUESTED} from 'state/reducers/data';

import germanyTopo from '!!file!data/germany.json';
import kreg2014Topo from '!!file!data/kreg-2014.json';
import krsTopo from '!!file!data/krs.json';

const createAgsToDistrictMapper = (map = {}) => {
  return ags => {
    if (ags) {
      const districtId = ags.slice(0, 5);
      return map[districtId] || districtId;
    }
    return undefined;
  };
};

const nameByIntId = (id, geoJson) => {
  const idInt = +id;
  const f = geoJson.features.find(d => d.id === idInt);
  return f ? f.properties.name : undefined;
};

const features = [
  {key: 'germany', file: germanyTopo, object: 'germany'},
  {
    key: 'states',
    file: germanyTopo,
    object: 'states',
    name: (id, geoJson) => {
      const f = geoJson.features.find(d => d.id === id);
      return f ? f.id : undefined;
    }
  },
  {key: 'kreg-2014', file: kreg2014Topo, object: 'kreg-2014', name: nameByIntId},
  {key: 'krs-2014', file: krsTopo, object: 'krs-2014', name: nameByIntId, agsMapper: createAgsToDistrictMapper()},
  {key: 'krs-2015', file: krsTopo, object: 'krs-2015', name: nameByIntId, agsMapper: createAgsToDistrictMapper()},
  {key: 'krs-2016', file: krsTopo, object: 'krs-2016', name: nameByIntId, agsMapper: createAgsToDistrictMapper()},
  {
    key: 'krs-mpidr-396',
    file: krsTopo,
    object: 'krs-mpidr-396',
    name: nameByIntId,
    agsMapper: createAgsToDistrictMapper({
      '13071': '13991',
      '13075': '13991',
      '15001': '15991',
      '15082': '15991',
      '15086': '15991',
      '15091': '15991',
      '15085': '15992',
      '15089': '15992',
      '16056': '16063',
      '16063': '16063'
    })
  }
].reduce(
  (index, feature) => {
    index[feature.key] = {
      selector: createSelector(
        state => state.data.getIn([feature.file, 'error']),
        state => state.data.getIn([feature.file, 'status']) === DATA_STATUS_REQUESTED,
        createSelector(
          state => state.data.getIn([feature.file, 'data']),
          data => {
            if (data) {
              return topojsonFeature(data, data.objects[feature.object]);
            }
            return undefined;
          }
        ),
        (error, isLoading, geoJson) => {
          return {
            error,
            isLoading,
            geoJson,
            name: id => feature.name(id, geoJson),
            agsMapper: feature.agsMapper
          };
        }
      ),
      load: (dispatch) => dispatch(loadData(feature.file))
    };
    return index;
  },
  {}
);

export default key => {
  if (!features[key]) {
    throw new Error(`Unkown feature ${key}`);
  }
  return features[key];
};

const GEO_TIFFS = ['07-02-miv', '07-02-oev', '10-01-no2']
  .map(key => ({
    key,
    url: require(`data/${key}.png`),
    bbox: [[5, 55.0], [15.2, 47]] // keep in sync with make geotiff
  }))
  .reduce(
    (index, geotiff) => {
      index[geotiff.key] = geotiff;
      return index;
    },
    {}
  );

export const availableGeotiffs = Object.keys(GEO_TIFFS);
export const getGeotiff = (geotiff) => {
  return GEO_TIFFS[geotiff] || false;
};
