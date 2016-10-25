
# FlexContainer 💪

The flexContainer function makes it a bit less tedious to define a prefixed `display: flex` element.

```code|lang-js
import { flexContainer } from 'theme/helpers';

const styles = StyleSheet.create({
  element: {
    ...flexContainer({})
  }
});
```

## Currently supports:


Centering children either horizontal, vertical or both.
```code|lang-jsx
...flexContainer({center: 'both' || 'horizontal' || 'vertical'})
```

Defining the flow direction
```code|lang-jsx
...flexContainer({direction: 'row' || 'row-reverse' || 'column' || 'column-reverse' || 'initial' || 'inherit'})
```


```code|lang-jsx
...flexContainer({justify: 'start' || 'end'})
```

```code|lang-jsx
...flexContainer({space: 'between' || 'around'})
```


