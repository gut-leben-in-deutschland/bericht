import {selectContent} from './reducer';

export const CONTENT_REQUEST = 'CABINET_CONTENT_REQUEST';
export const CONTENT_RECEIVE = 'CABINET_CONTENT_RECEIVE';
export const CONTENT_FAILURE = 'CABINET_CONTENT_FAILURE';
export const CONTENT_BATCH_UPDATE = 'CABINET_CONTENT_BATCH_UPDATE';

export const requestContent = (path) => ({
  type: CONTENT_REQUEST,
  path
});
export const receiveContent = (path, data) => ({
  type: CONTENT_RECEIVE,
  path,
  data
});
export const failureContent = (path, error) => ({
  type: CONTENT_FAILURE,
  path,
  error
});

export const loadContent = (path) => (dispatch, getState, {getApi}) => {
  if (selectContent(getState().cabinet, path, 'status')) {
    return;
  }

  dispatch(requestContent(path));

  getApi((api) => {
    api.loadFile(path, (error, data) => {
      if (error) {
        if (__DEV__) {
          console.error(error); // eslint-disable-line no-console
        }
        dispatch(failureContent(path, error));
        return;
      }
      dispatch(receiveContent(path, data));
    }, dispatch);
  });
};

export const batchUpdateContent = (content) => ({
  type: CONTENT_BATCH_UPDATE,
  content
});
