import PropTypes from 'prop-types';
import React from 'react';

import App from 'components/App/App';
import Static from 'containers/Static';

const containers = require.context('containers');

const withCabinetLocale = ({locale}) => (WrappedComponent) => {
  class Localized extends React.Component {
    getChildContext() {
      return {
        cabinetLocale: locale
      };
    }

    render() {
      return <WrappedComponent locale={locale} {...this.props} />;
    }
  }

  Localized.childContextTypes = {
    cabinetLocale: PropTypes.string.isRequired
  };

  return Localized;
};

const getRoutes = (routes, {locale, t}) => {
  return routes
    .reduce((routerRoutes, route) => {
      const RouteContainer = (props) => React.createElement(
        containers('./' + route.container).default,
        {...props, route, locale}
      );
      return routerRoutes.concat({
        path: `${t.locale(locale)(route.key)}(/)(index.html)`,
        component: RouteContainer
      });
    }, []);
};

export default ({routes, locales, t}) => {
  const validRoutes = routes.filter(r => r.key);

  // reverse lookup for matching pathnames to route keys
  const routeKeyMap = locales.reduce((map, locale) => {
    validRoutes.forEach((route) => {
      map[t.locale(locale)(route.key)] = route.key;
    });
    return map;
  }, {});
  const normalizePathname = (pathname) => `/${pathname.replace(/^\//, '').replace(/\/$/, '')}`;
  const getRouteKey = (pathname) => {
    const key = routeKeyMap[normalizePathname(pathname)];
    if (!key) {
      throw Error(`No route key found for ${pathname}`);
    }
    return key;
  };

  const localizedRoutes = locales.map((locale) => {
    const LocalizedApp = withCabinetLocale({locale})(App);
    return {
      component: (props) => <LocalizedApp {...props} />,
      childRoutes: [
        ...getRoutes(validRoutes, {locale, t})
      ]
    };
  });

  if (__PHANTOM__ || __DEV__) {
    const ChartContainer = require('containers/Chart').default;

    locales.map((locale) => {
      localizedRoutes.push({
        path: `_chart/${locale}/:id`,
        component: withCabinetLocale({locale})(ChartContainer)
      });
    });
  }

  const GermanApp = withCabinetLocale({locale: 'de'})(App);
  const NotFoundContainer = (props) => (
    <GermanApp>
      <Static
        {...props}
        route={{key: 'route/404', container: 'Static', file: 'static/404/index'}}
      />
    </GermanApp>
  );

  localizedRoutes.push({
    path: '*',
    component: NotFoundContainer
  });

  return {
    localizedRoutes,
    getRouteKey
  };
};
