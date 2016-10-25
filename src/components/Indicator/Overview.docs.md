# Header

## OverviewHeader

Has a fixed text, non-expandable.

```react|noSource
<OverviewHeader />
```

# Card

```react|noSource,span-2
<Card
  card={{
    dimensionId: '01',
    indicatorId: '01-01',
    color: '#F28502',
    dimension: 'Gesund durchs Leben',
    indicator: 'Entwicklungszusammenarbeit',
    chart: <div />
  }}
  locale='de'
  t={m => m} />
```

```react|noSource,span-3
<Card
  card={{
    dimensionId: '02',
    indicatorId: '02-03',
    color: '#23614E',
    dimension: 'In globaler Verantwortung handeln und Frieden sichern',
    indicator: 'Globale unternehmerische Verantwortung',
    chart: <NoDataAvailable />
  }}
  locale='en'
  t={m => m} />
```
