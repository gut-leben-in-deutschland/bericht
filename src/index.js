import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import configureCabinet from './configureCabinet';
import {contentFromRequireContext} from 'cabinet';
import AppRoot from 'components/AppRoot';

import 'theme/global.css';

const middlewares = [];

if (process.env.NODE_ENV !== 'production') {
  const installDevTools = require('immutable-devtools');
  installDevTools(require('immutable'));

  const createLogger = require('redux-logger');
  const logger = createLogger({
    collapsed: true
  });
  middlewares.push(logger);

  window.Perf = require('react-addons-perf');
}

const loadContent = (path, callback, dispatch, actions) => {
  const basePath = path.split('/')[0];

  const failure = () => callback(`Can't find your path! ${path}`);
  const update = content => {
    dispatch(actions.batchUpdateContent(content));
    if (!content.has(path)) {
      failure();
    }
  };

  switch (basePath) {
  case '01':
    require.ensure([], () => {
      update(require('./content/dimension-01/content').default);
    }, 'dimension-01-content');
    break;
  case '02':
    require.ensure([], () => {
      update(require('./content/dimension-02/content').default);
    }, 'dimension-02-content');
    break;
  case '03':
    require.ensure([], () => {
      update(require('./content/dimension-03/content').default);
    }, 'dimension-03-content');
    break;
  case '04':
    require.ensure([], () => {
      update(require('./content/dimension-04/content').default);
    }, 'dimension-04-content');
    break;
  case '05':
    require.ensure([], () => {
      update(require('./content/dimension-05/content').default);
    }, 'dimension-05-content');
    break;
  case '06':
    require.ensure([], () => {
      update(require('./content/dimension-06/content').default);
    }, 'dimension-06-content');
    break;
  case '07':
    require.ensure([], () => {
      update(require('./content/dimension-07/content').default);
    }, 'dimension-07-content');
    break;
  case '08':
    require.ensure([], () => {
      update(require('./content/dimension-08/content').default);
    }, 'dimension-08-content');
    break;
  case '09':
    require.ensure([], () => {
      update(require('./content/dimension-09/content').default);
    }, 'dimension-09-content');
    break;
  case '10':
    require.ensure([], () => {
      update(require('./content/dimension-10/content').default);
    }, 'dimension-10-content');
    break;
  case '11':
    require.ensure([], () => {
      update(require('./content/dimension-11/content').default);
    }, 'dimension-11-content');
    break;
  case '12':
    require.ensure([], () => {
      update(require('./content/dimension-12/content').default);
    }, 'dimension-12-content');
    break;
  default:
    failure();
  }
};

const initialContent = contentFromRequireContext({
  markdown: require.context('!!../cabinet/markdown/loader!content', false, /.*\.md$/),
  image: require.context('content', false, /.*\.(jpe?g|gif|png|svg)$/),
  dsv: require.context('content', false, /.*\.(t|c)sv$/)
})
  .merge(
    contentFromRequireContext({
      markdown: require.context('!!../cabinet/markdown/loader!content/static', true, /.*\.md$/),
      image: require.context('content/static', true, /.*\.(jpe?g|gif|png|svg)$/),
      dsv: require.context('content/static', true, /.*\.(t|c)sv$/),
      basePath: 'static'
    })
  )
  .merge(
    contentFromRequireContext({
      markdown: require.context('!!../cabinet/markdown/loader!content/X1', true, /.*\.md$/),
      image: require.context('content/X1', true, /.*\.(jpe?g|gif|png|svg)$/),
      dsv: require.context('content/X1', true, /.*\.(t|c)sv$/),
      basePath: 'X1'
    })
  )
  .merge(
    contentFromRequireContext({
      markdown: require.context('!!../cabinet/markdown/loader!content/X2', true, /.*\.md$/),
      image: require.context('content/X2', true, /.*\.(jpe?g|gif|png|svg)$/),
      dsv: require.context('content/X2', true, /.*\.(t|c)sv$/),
      basePath: 'X2'
    })
  )
  .merge(
    contentFromRequireContext({
      markdown: require.context('!!../cabinet/markdown/loader!content/X3', true, /.*\.md$/),
      image: require.context('content/X3', true, /.*\.(jpe?g|gif|png|svg)$/),
      dsv: require.context('content/X3', true, /.*\.(t|c)sv$/),
      basePath: 'X3'
    })
  ).merge(
    window.__INITIAL_CABINET_CONTENT__
  );

const cabinetConfig = configureCabinet({
  initialContent,
  loadContent,
  middlewares
});


if (__DEV__) {
  window.cabinetApi = cabinetConfig.api;
}

// Client render
if (typeof document !== 'undefined') {
  ReactDOM.render((
    <AppContainer>
      <AppRoot configuration={cabinetConfig} />
    </AppContainer>
  ), document.getElementById('app'));

  if (module.hot) {
    module.hot.accept('./components/AppRoot', () => {
      // If you use Webpack 2 in ES modules mode, you can
      // use <App /> here rather than require() a <NextApp />.
      // const NextApp = require('./App').default;
      const NextAppRoot = require('./components/AppRoot').default;
      ReactDOM.render(
        <AppContainer>
          <NextAppRoot configuration={cabinetConfig} />
        </AppContainer>,
        document.getElementById('app')
      );
    });
  }
}
