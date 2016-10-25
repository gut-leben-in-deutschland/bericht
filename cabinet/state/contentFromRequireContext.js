import {Map} from 'immutable';
import {CONTENT_STATUS_RECEIVED} from './reducer';
import {join} from 'path';

export default ({markdown, image, dsv, basePath = ''}) => {
  const normalizeContentPath = (path) => join(basePath, path);
  return Map()
    .merge(Map(markdown.keys().map(p => [normalizeContentPath(p), Map({status: CONTENT_STATUS_RECEIVED, data: markdown(p)})])))
    .merge(Map(image.keys().map(p => [normalizeContentPath(p), Map({status: CONTENT_STATUS_RECEIVED, data: image(p)})])))
    .merge(Map(dsv.keys().map(p => [normalizeContentPath(p), Map({status: CONTENT_STATUS_RECEIVED, data: dsv(p)})])));
};
