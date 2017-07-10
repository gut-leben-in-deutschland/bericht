import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Helmet from 'react-helmet';
import {RouterContext, match, useRouterHistory} from 'react-router';
import {createMemoryHistory} from 'history';
import {StyleSheetServer} from 'aphrodite';
import {Cabinet, contentFromRequireContext} from 'cabinet';
import htmlTemplate from './html';
import getRoutes from './routes';
import configureCabinet from './configureCabinet';

import 'theme/global.css';

const initialContent = contentFromRequireContext({
  markdown: require.context('!!../cabinet/markdown/loader!content', true, /.*\.md$/),
  image: require.context('content', true, /.*\.(jpe?g|gif|png|svg)$/),
  dsv: require.context('content', true, /.*\.(t|c)sv$/)
});

const cabinetConfig = configureCabinet({
  initialContent
});

const dimensionIdRouteKeyRe = /^route\/(report|dimension|indicator)-(\d{2})/;
const getDimensionIdFromRouteKey = (routeKey) => {
  const matches = dimensionIdRouteKeyRe.exec(routeKey);
  if (matches) {
    return matches[2];
  }
  return null;
};

// Static render
export default (locals, callback) => {
  const stylePath = locals.webpackStats.toJson().assetsByChunkName.app[1];
  const cabinet = cabinetConfig.selectCabinet(cabinetConfig.store.getState());
  const cabinetWithDefaultLocale = {
    ...cabinet,
    t: cabinet.translations(cabinetConfig.defaultLocale)
  };

  const {localizedRoutes: routes, getRouteKey} = getRoutes(cabinetWithDefaultLocale);
  const history = useRouterHistory(createMemoryHistory)({basename: __webpack_public_path__.replace(/\/$/, '')});
  const location = locals.path;

  match({routes, history, location}, (error, redirectLocation, renderProps) => {
    console.log('Rendering route', renderProps.location.pathname); // eslint-disable-line no-console
    const maybeDimensionId = renderProps.location.pathname === '/404.html'
      ? null
      : getDimensionIdFromRouteKey(getRouteKey(renderProps.location.pathname));

    const dimensionContentAsset = locals.assets[`dimension-${maybeDimensionId}`];

    const {html, css} = StyleSheetServer.renderStatic(() => {
      return ReactDOMServer.renderToString(
        <Cabinet configuration={cabinetConfig}>
          <RouterContext {...renderProps} />
        </Cabinet>
      );
    });

    const head = Helmet.renderStatic();

    callback(error, htmlTemplate(
      {common: locals.assets.common, app: locals.assets.app, dimensionContent: dimensionContentAsset, style: stylePath, favicon: '', ogImage: ''},
      html,
      css,
      head
    ));
  });
};
