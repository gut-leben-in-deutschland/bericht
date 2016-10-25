## Container

Container wraps children in a way that limits the content width and adds horizontal padding for `<Grid>` components.

```react
<Container>…</Container>
```

## Grid & Span

### Props

- `s` Span width for small sizes. Fractions of 2, e.g. `1/2`
- `m` Span width for medium up. Fractions of 6, e.g. `5/6`

```hint
`<Span>` must be nested in `<Grid>`
```

```react
<Grid>
  <Span s='1/2' m='2/6'>Foo</Span>
  <Span s='1/2' m='4/6'>Bar</Span>
</Grid>
```
