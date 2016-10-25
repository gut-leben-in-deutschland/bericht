
The loading indicator centers itself in a flex container.

```react
<div style={{width: '100%', height: 500, display: 'flex'}}>
  <LoadingIndicator t={() => 'Loading'} />
</div>
```

It shows up after a configurable `delay` (default: 500ms).

```react
span: 2
---
<div style={{width: '100%', height: 100, display: 'flex'}}>
  <LoadingIndicator
    delay={0}
    t={() => 'Loading'}
  />
</div>
```

```react
span: 2
---
<div style={{width: '100%', height: 100, display: 'flex'}}>
  <LoadingIndicator
    delay={1000}
    t={() => 'Loading'}
  />
</div>
```

```react
span: 2
---
<div style={{width: '100%', height: 100, display: 'flex'}}>
  <LoadingIndicator
    delay={5000}
    t={() => 'Loading'}
  />
</div>
```
