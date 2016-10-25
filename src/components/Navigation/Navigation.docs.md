# StickyNavBar

The `StickyNavBar` is a simple 'back' style button which is shown just below
the site header. It sticks to the top when the user scrolls down.

```react|noSource,span-2
<StickyNavBar to='#' label='The Sticky Navigation Bar Label With An Ultra Long Title' />
```

```react|noSource,span-4
<StickyNavBar to='#' label='DO NOT CLICK ME!' />
```

# BottomNavBar

This component already contains the left/right content padding. There is no need
to wrap this in a `<Container>`.

```hint
These component uses different breakpoints than are shown on this page!
The span-X widths in the catalog don't correspond to breakpoints which are
used inside the application.
```

```react|noSource,frame
<BottomNavBar
  prev={{
    subTitle: 'Bildungschancen für alle',
    title: 'Vom Bürgerdialog zum Indikatoren-Bericht',
    to: 'route/index'
  }}
  next={{
    subTitle: 'Bildungschancen für alle',
    title: 'Frühe Schulabgänger',
    to: 'route/index'
  }} />
```

```react|noSource,frame,span-2
<BottomNavBar
  prev={{
    subTitle: 'Bildungschancen für alle',
    title: 'Vom Bürgerdialog zum Indikatoren-Bericht',
    to: '#'
  }}
  next={{
    subTitle: 'Bildungschancen für alle',
    title: 'Frühe Schulabgänger',
    to: '#'
  }} />
```

```react|noSource,frame,span-4
<BottomNavBar
  prev={{
    subTitle: 'Bildungschancen für alle',
    title: 'Vom Bürgerdialog zum Indikatoren-Bericht',
    to: '#'
  }}
  next={{
    subTitle: 'Bildungschancen für alle',
    title: 'Frühe Schulabgänger',
    to: '#'
  }} />
```

Example which shows no *back* link. Just one to jump to the next section.

```react|noSource,frame
<BottomNavBar
  next={{
    subTitle: 'Bildungschancen für alle',
    title: 'Frühe Schulabgänger',
    to: '#'
  }} />
```


Examples with super long labels

```react|noSource,frame
<BottomNavBar
  prev={{
    subTitle: 'Bildungschancen für alle',
    title: 'Anteil der Menschen, die Arbeitszeit aufgrund von Betreuungspflichten reduziert oder die Erwerbstätigkeit vollkommen aufgegeben haben',
    to: 'route/index'
  }}
  next={{
    subTitle: 'Gut arbeiten und gerecht teilhaben',
    title: 'Vergleich der tatsächlichen und gewünschten Arbeitszeit',
    to: 'route/index'
  }} />
```

```react|noSource,frame,span-2
<BottomNavBar
  prev={{
    subTitle: 'Zeit haben für Familie und Beruf',
    title: 'Anteil und Entwicklung des ehrenamtlichen Engagements',
    to: '#'
  }}
  next={{
    subTitle: 'Bildungschancen für alle',
    title: 'Anteil der öffentlichen Ausgaben für Entwicklungszusammenarbeit am Bruttonationaleinkommen',
    to: '#'
  }} />
```

```react|noSource,frame,span-4
<BottomNavBar
  prev={{
    subTitle: 'Ein sicheres Einkommen',
    title: 'Lebenserwartung bei Geburt und die fernere Lebenserwartung im Alter',
    to: '#'
  }}
  next={{
    subTitle: 'Sicher und frei leben',
    title: 'Anzahl von Einwohnern, die von jeweils einem Haus- und Facharzt versorgt wird',
    to: '#'
  }} />
```
