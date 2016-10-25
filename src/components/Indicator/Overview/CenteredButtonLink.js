import React, {PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';

import Link from 'components/ButtonLink/Link';
import buttonStyles from 'components/ButtonLink/Styles';
import {NarrowContainer} from 'components/Grid/Grid';

import {s, m} from 'theme/mediaQueries';


const styles = StyleSheet.create({
  root: {
    textAlign: 'center',
    paddingBottom: 32
  },
  button: {
    [s]: {
      width: '100%'
    },
    [m]: {
      width: 'auto'
    }
  }
});

export function CenteredButtonLink({t, to, label}) {
  return (
    <div className={css(styles.root)}>
      <NarrowContainer>
        <Link t={t} href={to} className={css(buttonStyles.primaryButton, styles.button)}>{label}</Link>
      </NarrowContainer>
    </div>
  );
}

CenteredButtonLink.propTypes = {
  t: PropTypes.func.isRequired,
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
};
