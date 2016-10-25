### Header

```react
frame: true
---
<Header routeKey='route/index'></Header>
```

```react
span: 3
frame: true
---
<div style={{height: 480}}>
  <Header routeKey='route/index'></Header>
</div>
```

#### Ribbon Color

#####  Automatically by dimension id

```react
frame: true
---
<Header dimensionId='01' routeKey='route/index'></Header>
```

#####  Manually

```react
frame: true
---
<Header ribbonColor='pink' routeKey='route/index'></Header>
```

Header is connected to Cabinet for routes and translations. The current route key need to be provided with the `routeKey` property.

# Menu

```react
<Menu
  t={t}
  label='Menü'
  primary={[
    {href: '#', label: 'First Item'},
    {href: '#', label: 'Second Item'}
  ]}
  meta={[
    {href: '#', label: 'First Item'},
    {href: '#', label: 'Second Item'}
  ]}
/>
```

The menu is a simple list of link. However it is responsive and collapses on mobile. It relies on the [`onlyS` breakpoint](/docs/media-queries) to collapse.

## Mobile Menu

```react
span: 3
frame: true
state:
  expanded: false
---
<div style={{height: 480}}>
  <Menu
    t={t}
    label='Menü'
    expanded={state.expanded}
    toggle={() => setState({expanded: !state.expanded})}
    primary={[
      {href: '#', label: 'First Item'},
      {href: '#', label: 'Second Item'}
    ]}
    meta={[
      {href: '#', label: 'First Item'},
      {href: '#', label: 'Second Item'}
    ]}
  />
</div>
```

```react
span: 3
frame: true
state:
  expanded: true
---
<div style={{height: 480}}>
  <Menu
    t={t}
    label='Menü'
    expanded={state.expanded}
    toggle={() => setState({expanded: !state.expanded})}
    primary={[
      {href: '#', label: 'First Item'},
      {href: '#', label: 'Second Item'}
    ]}
    meta={[
      {href: '#', label: 'First Item'},
      {href: '#', label: 'Second Item'}
    ]}
  />
</div>
```
