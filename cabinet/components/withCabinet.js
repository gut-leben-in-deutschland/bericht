/* eslint-disable react/no-multi-comp */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {connect} from 'react-redux';
import {loadContent} from '../state/actions';
import {selectContent, CONTENT_STATUS_REQUESTED, CONTENT_STATUS_RECEIVED, CONTENT_STATUS_FAILED} from '../state/reducer';
import {createSelector} from 'reselect';
import createShallowEqualSelector from '../utils/createShallowEqualSelector';

/*

API:

withCabinet((props) => {
  return {
    foo: 'content/foo.tsv',
    bar: 'content/bar.tsv'
  }
})(MyComponent) // `foo` prop is passed to `MyComponent` instances

*/

const getDisplayName = (component) => component.displayName || component.name || 'Component';

const defaultMapContentToProps = () => ({});

const getContentData = (content) => {
  let data = {};
  Object.keys(content).forEach(k => {
    if (content[k]) {
      data[k] = content[k].get('data');
    }
  });
  return data;
};
const getContentErrors = (content) => {
  const keys = Object.keys(content);
  return keys
    .filter(k => content[k] && content[k].get('status') === CONTENT_STATUS_FAILED)
    .map(k => {
      return content[k].get('error');
    })
    .concat(keys.filter(k => !content[k]));
};

const contentIsComplete = (content) => {
  return Object.keys(content).every(k => content[k] && content[k].get('status') === CONTENT_STATUS_RECEIVED);
};

const contentIsRequested = (content) => {
  return Object.keys(content).some(k => content[k] && content[k].get('status') === CONTENT_STATUS_REQUESTED);
};

const contentIsFailed = (content) => {
  return Object.keys(content).some(k => !content[k] || content[k].get('status') === CONTENT_STATUS_FAILED);
};

const withCabinet = (mapContentToProps, selectLocalizedCabinet, WrappedComponent) => {
  class WithCabinet extends Component {
    componentWillMount() {
      // we need memoize props based content per instance
      this.selectCabinetContentProps = createShallowEqualSelector(
        selectLocalizedCabinet,
        (state, {cabinetContext, ...props}) => props, // eslint-disable-line no-unused-vars
        (cabinet, props) => {
          return mapContentToProps({...props, cabinet});
        }
      );
      this.selectCabinetContent = createShallowEqualSelector(
        (state, props) => {
          const contentProps = props.selectCabinetContentProps(state, props);
          const contentPropKeys = Object.keys(contentProps);

          return contentPropKeys.reduce((content, key) => {
            const path = contentProps[key];
            content[key] = selectContent(state.cabinet, path);
            return content;
          }, {});
        },
        content => content
      );
    }
    render() {
      return <WrappedComponent {...this.props} cabinetContext={this.context.cabinet} locale={this.context.cabinetLocale} selectCabinetContent={this.selectCabinetContent} selectCabinetContentProps={this.selectCabinetContentProps} />;
    }
  }
  WithCabinet.contextTypes = {
    cabinet: PropTypes.object.isRequired,
    cabinetLocale: PropTypes.string
  };
  WithCabinet.displayName = `WithCabinet(${getDisplayName(WrappedComponent)})`;
  return WithCabinet;
};

const connectCabinet = (mapContentToProps = defaultMapContentToProps, additionalProps = {}) => (WrappedComponent) => {
  class ConnectCabinet extends Component {
    componentWillMount() {
      this.loadContent(this.props);
    }
    componentWillReceiveProps(props) {
      this.loadContent(props);
    }
    loadContent(props) {
      props.dispatch(loadContent(props.cabinet.translationsPath));
      props.dispatch(loadContent(props.cabinet.routesPath));

      const {cabinetContentProps} = props;
      Object.keys(cabinetContentProps).forEach((key) => {
        const path = cabinetContentProps[key];
        props.dispatch(loadContent(path));
      });
    }
    render() {
      const {
        cabinetContent,
        // strip out
        selectCabinetContent, selectCabinetContentProps, cabinetContentProps, cabinetContext, dispatch, // eslint-disable-line no-unused-vars
        // forward
        ...props
      } = this.props;

      const {CabinetLoading, CabinetLoadingError} = cabinetContext;

      if (contentIsRequested(cabinetContent)) {
        return <CabinetLoading t={props.cabinet.t} />;
      }

      if (contentIsFailed(cabinetContent)) {
        return <CabinetLoadingError t={props.cabinet.t} errors={getContentErrors(cabinetContent)} />;
      }

      if (contentIsComplete(cabinetContent)) {
        return <WrappedComponent {...props} {...additionalProps} {...getContentData(cabinetContent)} />;
      }

      return null;
    }
  }

  ConnectCabinet.propTypes = {
    selectCabinetContent: PropTypes.func,
    selectCabinetContentProps: PropTypes.func,
    cabinetContext: PropTypes.object.isRequired,
    cabinetContentProps: PropTypes.object.isRequired,
    cabinetContent: PropTypes.object.isRequired,
    cabinet: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
  };

  ConnectCabinet.displayName = `ConnectCabinet(${getDisplayName(WrappedComponent)})`;

  const selectLocalizedCabinet = createSelector(
    (state, {cabinetContext}) => cabinetContext.selectCabinet(state),
    (state, {locale, cabinetContext}) => locale || cabinetContext.defaultLocale,
    (cabinet, locale) => {
      return {
        ...cabinet,
        t: cabinet.translations(locale),
        locale
      };
    }
  );
  const mapStateToProps = (state, props) => ({
    cabinetContentProps: props.selectCabinetContentProps(state, props),
    cabinetContent: props.selectCabinetContent(state, props),
    cabinet: selectLocalizedCabinet(state, props)
  });

  return withCabinet(mapContentToProps, selectLocalizedCabinet, connect(mapStateToProps)(ConnectCabinet));
};

export default connectCabinet;
