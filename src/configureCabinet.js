import {configure as configureCabinet} from 'cabinet';
import {DEFAULT_LOCALE, AVAILABLE_LOCALES, GITHUB_CONTENT_SOURCE, GITHUB_AUTH} from './constants';
import flagship from 'state/reducers/flagship';
import data from 'state/reducers/data';


export default ({initialContent, loadContent, middlewares = []}) => configureCabinet({
  defaultLocale: DEFAULT_LOCALE,
  locales: AVAILABLE_LOCALES,
  contentBase: 'content',
  basePath: null,
  github: GITHUB_CONTENT_SOURCE,
  auth: GITHUB_AUTH,
  translationsPath: 'translations.csv',
  routesPath: 'routes.tsv',
  redux: {
    middlewares,
    reducers: {
      flagship,
      data
    }
  },
  initialContent,
  loadContent
});
