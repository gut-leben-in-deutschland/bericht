import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet, css} from 'aphrodite';
import {m, onlyS} from 'theme/mediaQueries';
import {beige, softBeige} from 'theme/constants';
import {flexContainer} from 'theme/helpers';
import MenuButton from './MenuButton';
import {PrimaryLink, MetaLink, MetaIcon} from './MenuLinks';

const styles = StyleSheet.create({
  container: {
    [m]: {
      ...flexContainer({direction: 'column'}),
      flexGrow: 1
    }
  },
  menu: {
    [m]: {
      ...flexContainer({direction: 'column-reverse', space: 'between'}),
      flexGrow: 1
    },
    [onlyS]: {
      position: 'absolute',
      zIndex: 5,
      left: 0,
      top: 0,
      width: '100%',
      backgroundColor: 'white',
      padding: '70px 0 0 0',
      textAlign: 'left'
    }
  },
  menuCollapsed: {
    [onlyS]: {
      display: 'none'
    }
  },
  primaryNav: {
    [onlyS]: {
      padding: '0 20px'
    }
  },
  metaNav: {
    [onlyS]: {
      background: softBeige,
      padding: '0 20px 20px 20px'
    }
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    textAlign: 'right',
    [onlyS]: {
      textAlign: 'left'
    }
  },
  listItem: {
    display: 'inline-block',
    marginLeft: 40,
    [onlyS]: {
      borderBottom: `1px solid ${beige}`,
      display: 'block',
      margin: 0
    }
  },
  listItemMeta: {
    marginLeft: 10
  },
  backdrop: {
    display: 'none',
    [onlyS]: {
      display: 'block',
      position: 'fixed',
      top: 10,
      left: 0,
      height: '100vh',
      width: '100vw',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
  },
  toggle: {
    display: 'none',
    [onlyS]: {
      display: 'block',
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      zIndex: 10
    }
  }
});

const Menu = ({t, primary, meta, expanded, toggle, label}) => (
  <div className={css(styles.container)}>
    {expanded && <div className={css(styles.backdrop)} onClick={toggle} />}
    <div className={css(styles.toggle)}>
      <MenuButton label={label} onClick={toggle} expanded={expanded} />
    </div>
    <div className={css(styles.menu, !expanded && styles.menuCollapsed)}>
      <nav className={css(styles.primaryNav)}>
        <ul className={css(styles.list)}>
          {primary.map((item, i) => (
            <li key={i} className={css(styles.listItem)}>
              <PrimaryLink t={t} onClick={toggle} href={item.href} active={item.active}>
                {item.label}
              </PrimaryLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className={css(styles.metaNav)}>
        <ul className={css(styles.list)}>
          {meta.map((item, i) => (
            <li key={i} className={css(styles.listItem, styles.listItemMeta)}>
              <MetaLink
                t={t}
                href={item.href}
                onClick={toggle}
                lang={item.lang}
                hrefLang={item.lang}
              >
                {item.icon && <MetaIcon>{item.icon}</MetaIcon>}
                {item.label}
              </MetaLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const linkType = PropTypes.shape({
  href: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  lang: PropTypes.string,
  icon: PropTypes.element
});

Menu.propTypes = {
  t: PropTypes.func.isRequired,
  primary: PropTypes.arrayOf(linkType).isRequired,
  meta: PropTypes.arrayOf(linkType).isRequired,
  label: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
  toggle: PropTypes.func
};
Menu.defaultProps = {
  expanded: false
};

export default Menu;
