import React, {PropTypes} from 'react';
import {Router, applyRouterMiddleware, useRouterHistory} from 'react-router';
import {createHistory} from 'history';
import useScroll from 'react-router-scroll';
import {withCabinet, Cabinet} from 'cabinet';
import getRoutes from '../routes';
import LoadingIndicator from 'components/LoadingIndicator/LoadingIndicator';

let getCatalogRoutes = () => {};
if (__CATALOG_ENABLED__) {
  getCatalogRoutes = require('../../docs/index');
}

const history = useRouterHistory(createHistory)({
  basename: __webpack_public_path__.replace(/\/$/, '')
});

// Piwik tracking
// With history v2, this will trigger an immediate pageview
history.listen(({pathname}) => {
  if (window._paq) {
    window._paq.push(['setCustomUrl', pathname]);
    window._paq.push(['trackPageView']);
  }
});

// Only update scroll when pathname is different from previous one.
// This ensures that hash links inside a page (e.g. for footnotes) are still working.
const shouldUpdateScroll = (prevRouterProps, {location}) => {
  return prevRouterProps && location.pathname !== prevRouterProps.location.pathname;
};

const CabinetRouter = withCabinet()(
  ({cabinet}) => {
    if (!cabinet.routes) { return null; }
    const catalogRoutes = {
      getChildRoutes: getCatalogRoutes('/docs', {imports: {t: cabinet.t}})
    };
    return <Router history={history} routes={[catalogRoutes, ...getRoutes(cabinet).localizedRoutes]} render={applyRouterMiddleware(useScroll(shouldUpdateScroll))} />;
  }
);

const AppRoot = ({configuration}) => (
  <Cabinet configuration={configuration} components={{CabinetLoading: LoadingIndicator}}>
    <CabinetRouter />
  </Cabinet>
);

AppRoot.propTypes = {
  configuration: PropTypes.object.isRequired
};

export default AppRoot;
