import {Map} from 'immutable';
import {DATA_REQUEST, DATA_RECIEVE, DATA_FAILURE} from 'state/actions/data';

const defaultState = Map();

export const DATA_STATUS_REQUESTED = 'DATA_STATUS_REQUESTED';
export const DATA_STATUS_RECEIVED = 'DATA_STATUS_RECEIVED';
export const DATA_STATUS_FAILED = 'DATA_STATUS_FAILED';

export default (state = defaultState, action) => {
  switch (action.type) {
  case DATA_REQUEST:
    return state
      .setIn([action.file, 'status'], DATA_STATUS_REQUESTED)
      .deleteIn([action.file, 'error']);
  case DATA_RECIEVE:
    return state
      .setIn([action.file, 'status'], DATA_STATUS_RECEIVED)
      .setIn([action.file, 'data'], action.data);
  case DATA_FAILURE:
    return state
      .setIn([action.file, 'status'], DATA_STATUS_FAILED)
      .setIn([action.file, 'data'], action.error);
  default:
    return state;
  }
};
