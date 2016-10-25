#  Breakpoints

We have three breakpoints:

- `s` – up to 640px
- `m` – 641px to 1024px
- `l` – 1025px to 1440px

They can be configured in `theme/mediaQueries.js` as integers. Currently they are not available for css modules.

# Media Queries

You can import ready to use media queries from `theme/mediaQueries`. For broad browser support they are [converted to em](http://zellwk.com/blog/media-query-units/). The default media query, exported as `s`, `m`, `l`, are min width queries and apply upwards. Additionally min and max width queries are provided as `onlyS`, `onlyM`, `onlyL`. For example `onlyM` applies to screens between 641px and 1024px.

## Example

```code|lang-jsx
import {m, l, onlyS} from 'theme/mediaQueries';

const styles = StyleSheet.create({
  container: {
    background: 'gray',
    textAlign: 'left',
    [onlyS]: {
      fontWeight: 'bold'
    },
    [m]: {
      background: 'red',
      textAlign: 'center'
    },
    [l]: {
      background: 'yellow',
      textAlign: 'right'
    }
  }
});

export default () => <span className={css(styles.container)}>Hello World</span>;
```
