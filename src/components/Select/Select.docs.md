# Select

We're using [JedWatson's `react-select`](https://github.com/JedWatson/react-select) wrapped in a `div` providing CSS modules namespace shielding.

The included CSS is based on [`react-select/scss` at revision `09dd255`](https://github.com/JedWatson/react-select/tree/09dd2553cec30d567eb48148c636c787fed3db15/scss).

## Install

Run the following command in the root of your project to install the component into `src/components`:

```
npm install react-select@1.0.0-beta9 --save && \
git archive --format tar --remote git@bitbucket.org:interactivethings/l1509-catalyst-2.0.git \
  HEAD src/components/Select | tar xvz
```

## Examples

### Static Options

```react
state:
  value: null
---
<Select
  value={state.value}
  onChange={(value) => setState({value})}
  options={[
    {value: 'one', label: 'One'},
    {value: 'two', label: 'Two'}
  ]} />
```

### Async Options

```react
state:
  value: null
---
<Select.Async
  value={state.value}
  onChange={(value) => setState({value})}
  loadOptions={(input, callback) => {
    setTimeout(() => callback(null, {
      options: [
        {value: 'one', label: 'One'},
        {value: 'two', label: 'Two'}
      ]
    }), 500)
  }} />
```

But you don't need to use this, you can also simply load the data elsewhere and set the options statically.

```react
<Select isLoading />
```

Be aware that your options will be filtered by `react-select`, [see filtering options](https://github.com/JedWatson/react-select#filtering-options).

### Multiselect

```react
state:
  value: null
---
<Select
  multi
  value={state.value}
  onChange={(value) => setState({value})}
  options={[
    {value: 'one', label: 'One'},
    {value: 'two', label: 'Two'}
  ]} />
```

- The default `delimiter` for value is `,`
- `onChange` will pass you an array of selected options
- `value` accepts an array of options, or a `delimiter` separated string of option values

[See complete documentation](https://github.com/jedwatson/react-select#multiselect-options)

## Styles

Static examples of styled states.

```react|span-3
<Select disabled value='one'
  options={[
    {value: 'one', label: 'One'}
  ]} />
```

```react|span-3
<Select disabled multi
  value={[
    {value: 'one', label: 'One'},
    {value: 'two', label: 'Two'}
  ]} />
```


```react|span-6
<Select />
```

```react|span-3
<Select value='one'
  options={[
    {value: 'one', label: 'One'}
  ]} />
```

```react|span-3
<Select multi
  value={[
    {value: 'one', label: 'One'},
    {value: 'two', label: 'Two', clearableValue: false}
  ]} />
```

