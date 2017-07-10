import PropTypes from 'prop-types';
import React, { Component, Children } from 'react';
import {Provider} from 'react-redux';
import {CabinetLoading, CabinetLoadingError} from './CabinetUI';

let CabinetUI = () => null;

if (__CABINET_ENABLED__) {
  const {CabinetBar} = require('./CabinetUI');
  CabinetUI = ({api}) => ( // eslint-disable-line react/prop-types
    api.isLoggedIn ?
      <CabinetBar action={api.logout} isConnected /> :
      <CabinetBar action={api.login} />
  );
}

class CabinetContext extends Component {
  getChildContext() {
    const {translationsPath, routesPath, locales, basePath, defaultLocale, api, selectCabinet} = this.props.configuration;
    return {
      cabinet: {
        locales,
        defaultLocale,
        basePath,
        routesPath,
        translationsPath,
        selectCabinet,
        api,
        CabinetLoading: this.props.components.CabinetLoading || CabinetLoading,
        CabinetLoadingError: this.props.components.CabinetLoadingError || CabinetLoadingError
      }
    };
  }

  componentWillReceiveProps() {
    // TODO: check for changed configuration, reload stuff if necessary
    // this.setState({loading: true});
    console.error(`Cabinet Warning: can't update CabinetContext with a new configuration yet`); // eslint-disable-line no-console
  }

  render() {
    const {children, configuration: {store, api}} = this.props;
    return (
      <Provider store={store}>
        <div>
          <CabinetUI api={api} />
          {Children.only(children)}
        </div>
      </Provider>
    );
  }
}

CabinetContext.propTypes = {
  configuration: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired,
  components: PropTypes.object.isRequired,
};

CabinetContext.defaultProps = {
  components: {}
};

CabinetContext.childContextTypes = {
  cabinet: PropTypes.object.isRequired
};

export default CabinetContext;
