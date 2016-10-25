import {createSelector} from 'reselect';
export {default as withCabinet} from './components/withCabinet';
export {default as Cabinet} from './components/CabinetContext';
export {default as contentFromRequireContext} from './state/contentFromRequireContext';
import {configureI18n} from './i18n';
import {configureApi} from './api';
import {configureStore} from './state/configureStore';
import {selectContent} from './state/reducer';

const baseConfig = {
  defaultLocale: undefined,
  locales: [],
  translationKeySeparator: '/',
  basePath: '/',
  redux: {
    reducers: {},
    middlewares: []
  },
  loadContent: (path) => {
    throw new Error(`${path} is not available. In local mode you need to prepopulate the cabinet store will all your content.`);
  }
};

export const configure = (userConfiguration) => {
  const configuration = {
    ...baseConfig,
    ...userConfiguration
  };

  const selectTranslationData = (state) => configuration.translationsPath ? selectContent(state.cabinet, configuration.translationsPath, 'data') : null;
  const selectRouteData = (state) => configuration.routesPath ? selectContent(state.cabinet, configuration.routesPath, 'data') : null;

  const selectTranslations = createSelector(
    selectTranslationData,
    (translations) => configureI18n(configuration, translations)
  );

  const selectRoutes = createSelector(
    selectTranslationData,
    selectRouteData,
    (translations, routes) => translations ? routes : null
  );

  const selectCabinet = createSelector(
    selectRoutes,
    selectTranslations,
    (routes, translations) => {
      return {
        routes,
        translations,
        locales: configuration.locales,
        // paths for withCabinet to always load
        translationsPath: configuration.translationsPath,
        routesPath: configuration.routesPath
      };
    }
  );

  const api = configureApi(configuration);

  const store = configureStore(configuration, api);

  return {
    ...configuration,
    api,
    store,
    selectCabinet
  };
};
