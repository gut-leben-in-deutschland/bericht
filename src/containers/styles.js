import {StyleSheet, css} from 'aphrodite';

const styles = StyleSheet.create({
  containerRoot: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  pageHeadWrapper: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
});

export function containerRootClassName() {
  return css(styles.containerRoot);
}

export function pageHeadWrapperClassName() {
  return css(styles.pageHeadWrapper);
}
