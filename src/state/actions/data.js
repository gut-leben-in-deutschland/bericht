import {json, csv} from 'd3-request';
import {extname} from 'path';

export const DATA_REQUEST = 'DATA_REQUEST';
export const DATA_RECIEVE = 'DATA_RECIEVE';
export const DATA_FAILURE = 'DATA_FAILURE';

export const requestData = (file) => ({
  type: DATA_REQUEST,
  file
});
export const recieveData = (file, data) => ({
  type: DATA_RECIEVE,
  file,
  data
});
export const failureData = (file, error) => ({
  type: DATA_FAILURE,
  file,
  error
});
export const loadData = (file) => (dispatch, getState) => {
  if (getState().data.getIn([file, 'status'])) {
    return;
  }

  dispatch(requestData(file));

  const callback = (error, data) => {
    if (error) {
      dispatch(failureData(file, error));
    } else {
      dispatch(recieveData(file, data));
    }
  };

  const ext = extname(file);
  if (ext === '.json') {
    json(file, callback);
  } else if (ext === '.csv') {
    csv(file, callback);
  } else {
    throw new Error(`Can't load file ${file}. Unknown file extension.`);
  }
};
