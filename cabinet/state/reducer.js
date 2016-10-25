import {Map} from 'immutable';

import {
  CONTENT_REQUEST, CONTENT_RECEIVE, CONTENT_FAILURE, CONTENT_BATCH_UPDATE
} from './actions';

const contentKey = (path, ...rest) => {
  return ['content', path, ...rest];
};

export const CONTENT_STATUS_REQUESTED = 'CABINET_CONTENT_STATUS_REQUESTED';
export const CONTENT_STATUS_RECEIVED = 'CABINET_CONTENT_STATUS_RECEIVED';
export const CONTENT_STATUS_FAILED = 'CABINET_CONTENT_STATUS_FAILED';

export const selectContent = (state, path, ...rest) => {
  return state.getIn(contentKey(path, ...rest));
};

const defaultState = Map();

export default (state = defaultState, action) => {
  switch (action.type) {
  case CONTENT_REQUEST:
    return state
      .setIn(contentKey(action.path, 'status'), CONTENT_STATUS_REQUESTED)
      .deleteIn(contentKey(action.path, 'error'));
  case CONTENT_RECEIVE:
    return state
      .setIn(contentKey(action.path, 'status'), CONTENT_STATUS_RECEIVED)
      .setIn(contentKey(action.path, 'data'), action.data);
  case CONTENT_FAILURE:
    return state
      .setIn(contentKey(action.path, 'status'), CONTENT_STATUS_FAILED)
      .setIn(contentKey(action.path, 'error'), action.error);
  case CONTENT_BATCH_UPDATE:
    return state
      .set('content', state.get('content').merge(action.content));
  default:
    return state;
  }
};
