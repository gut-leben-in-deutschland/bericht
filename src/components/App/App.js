import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import Helmet from 'react-helmet';

import {withCabinet} from 'cabinet';
import Footer from 'components/Footer/Footer';

import {text} from 'theme/constants';
import {sansRegular18} from 'theme/typeface';

import favicon from '!!file!./favicon.png';
import faviconApple from '!!file!./favicon-apple.png';

const styles = StyleSheet.create({
  everything: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  body: {
    flexGrow: 1,
    ...sansRegular18,
    color: text,

    display: 'flex',
    flexDirection: 'column',
  }
});

class App extends Component {
  render() {
    const {cabinet: {locale, t}} = this.props;
    return (
      <div className={css(styles.everything)}>
        <Helmet
          titleTemplate={`%s – ${t('title')}`}
          defaultTitle={t('title')}
        >
          <html lang={locale} />
          <link rel='apple-touch-icon-precomposed' href={faviconApple} />
          <link rel='shortcut icon' href={favicon} />
        </Helmet>
        <div className={css(styles.body)}>{this.props.children}</div>
        <Footer />
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.node,
  cabinet: PropTypes.object.isRequired
};

export default withCabinet()(App);
