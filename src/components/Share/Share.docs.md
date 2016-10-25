# Public

The footers have a transparent background, so that you can add whatever
background you need (the indicator pages and report pages use a different
background color).

The footers do include an top-border.

## ShareFooter

```react|noSource
<ShareFooter route={'/'} />
```

## ShareFooterData

```react|noSource
<ShareFooterData route={'/'} />
```

## ShareFooterReport

```react|noSource
<ShareFooterReport route={'/'} />
```


# Internal

## Share Links

### Props

- `href`
- `icon` one of `facebook`, `twitter`, `email`, `download`
- `subLabel`
- `label`
- `target` (optional)

```hint
Labels are hidden on small screens
```

```react
span: 3
---
<ShareLink
  href='#'
  icon='facebook'
  subLabel='Teilen auf'
  label='Facebook'
/>
```

```react
span: 3
---
<ShareLink
  href='#'
  icon='twitter'
  subLabel='Teilen auf'
  label='Twitter'
/>
```

```react
span: 3
---
<ShareLink
  href='#'
  icon='email'
  subLabel='Versenden per'
  label='Email'
/>
```

```react
span: 3
---
<ShareLink
  href='#'
  icon='download'
  subLabel='Download'
  label='PDF-Report'
/>
```
