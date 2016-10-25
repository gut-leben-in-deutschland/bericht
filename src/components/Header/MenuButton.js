import React, {PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';
import constants from 'theme/constants';
import {sansBold15} from 'theme/typeface';
import MenuIcon from 'components/Icons/Menu';
import CloseIcon from 'components/Icons/Close';
import Button from 'components/ButtonLink/Button';
import buttonStyles from 'components/ButtonLink/Styles';

const styles = StyleSheet.create({
  menuButton: {
    ...sansBold15,
    color: constants.text,
    background: 'transparent',
    textTransform: 'uppercase',
    lineHeight: 1,
    padding: '15px 20px',
    width: '100%'
  },
  buttonContent: {
    display: 'block'
  },
  icon: {
    float: 'right',
    marginLeft: 8
  },
  label: {
    display: 'block',
    textAlign: 'right'
  },
  labelExpanded: {
    textAlign: 'left',
    paddingLeft: 20
  }
});

const MenuButton = ({label, expanded, onClick}) => (
  <Button className={css(buttonStyles.base, styles.menuButton)} onClick={onClick}>
    <span className={css(styles.buttonContent)}>
      <span className={css(styles.label, (expanded ? styles.labelExpanded : null))}>
        {label}
      <span className={css(styles.icon)}>
        {expanded ? <CloseIcon /> : <MenuIcon />}
      </span>
      </span>
    </span>
  </Button>
);

MenuButton.propTypes = {
  label: PropTypes.string.isRequired,
  expanded: PropTypes.bool,
  onClick: PropTypes.func
};

MenuButton.defaultProps = {
  expanded: false,
  onClick: () => {}
};

export default MenuButton;
