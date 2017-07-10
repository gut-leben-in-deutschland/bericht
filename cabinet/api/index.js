import {join} from 'path';
import {configureAuth} from './auth';
import {requestContent, receiveContent, failureContent, batchUpdateContent} from '../state/actions';

const actions = {requestContent, receiveContent, failureContent, batchUpdateContent};

export const configureApi = (configuration) => {
  const loadFileUsingConfiguration = (path, callback, dispatch) =>
    configuration.loadContent(path, callback, dispatch, actions);

  if (!__CABINET_ENABLED__ || typeof document === 'undefined') {
    return {
      login: () => {},
      logout: () => {},
      isLoggedIn: false,
      getApi: (apiCallback) => {
        apiCallback({loadFile: loadFileUsingConfiguration});
      },
    };
  }

  const auth = configureAuth(configuration);
  const {login, logout, isLoggedIn} = auth;

  return {
    login,
    logout,
    isLoggedIn,
    getApi: (apiCallback) => {
      if (isLoggedIn) {
        require.ensure([], () => {
          const remoteApi = require('./github').default(configuration, auth, {
            // Parsers
            markdown: require('../markdown/parse'),
            tsv: require('d3-dsv').tsvParse,
            csv: require('d3-dsv').csvParse
          });

          const resolveContentPath = (path) => {
            // Avoid double contentBase
            const contentBaseCheck = new RegExp(`^${configuration.contentBase}/.*$`);
            return contentBaseCheck.test(path) ? path : join(configuration.contentBase, path);
          };

          apiCallback({
            loadFile: (path, callback) => remoteApi.loadFile(resolveContentPath(path), callback)
          });
        }, 'cabinet-api');
      } else {
        apiCallback({loadFile: loadFileUsingConfiguration});
      }
    }
  };
};
