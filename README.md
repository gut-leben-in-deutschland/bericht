# Gut Leben in Deutschland – interaktiver Bericht und Indikatoren

> Mit der Regierungsstrategie „Gut leben in Deutschland – was uns wichtig ist“ rückt die Bundesregierung die Lebensqualität in den Fokus ihres Regierungshandelns. Sie soll Maßstab für eine erfolgreiche Politik werden. Was aber verstehen die Menschen konkret unter einem „guten Leben“? Dies zeigte sich im Bürgerdialog der Bundesregierung. Sichtbar wurde ein breites und facettenreiches Verständnis der Bürgerinnen und Bürger von Lebensqualität. Auf dieser Grundlage und unter Einbeziehung weiterer nationaler und internationaler Erkenntnisse und Diskussionen wählte die Bundesregierung zwölf Dimensionen und 46 Indikatoren aus, um Stand und Entwicklung der Lebensqualität in Deutschland zu beschreiben und messbar zu machen.

> https://www.gut-leben-in-deutschland.de/

## Impressum

### Herausgeber

Presse- und Informationsamt der Bundesregierung    
Dorotheenstraße 84   
10117 Berlin  
Telefon: 030 – 18 272 -0   
Telefax: 030 – 18 10 272 -0   
E-Mail: internetpost@bundesregierung.de    

### Briefanschrift
11044 Berlin

### Verantwortlich für den Inhalt
Bundeskanzleramt, Stab Politische Planung, Grundsatzfragen und Sonderaufgaben und Bundesministerium für Wirtschaft und Energie, Leitungs- und Planungsabteilung

### Datenlizenzen
Siehe Indikatoren und  
[Liste aller Datenlizenzen auf GitHub](https://github.com/gut-leben-in-deutschland/bericht/blob/master/content/licenses.de.csv)

### Quellcode-Lizenz

Der Quellcode der Applikation ist [MIT-lizenziert](https://opensource.org/licenses/MIT).

## Technische Dokumentation/Technical Documentation

> *Hinweis: Die technische Dokumentation ist nur auf Englisch verfügbar.*

> *Note: The technical documentation is written in English.*

The application is built with JavaScript, [React](https://facebook.github.io/react/) and [D3](https://d3js.org/). It is built as a static website with client-side HTML5 pushstate routing.

### Prerequisites

- To run code and build the application you'll need [Node.js](https://nodejs.org/) (v6 recommended)
- To build GeoJSON files, [GDAL 2.0](http://www.gdal.org/) is needed (available on macOS as the 'osgeo/osgeo4mac/gdal-20' homebrew package)
- All build tasks are written in GNU Make, so a platform capable of running it is necessary (macOS, Linux, [Bash on Ubuntu on Windows](https://msdn.microsoft.com/commandline/wsl/about))

### Make tasks

#### Install dependencies and start the development server

```
make
```

#### Run tests

```
make test
```

- lints the code
- creates a test build
- runs automated accessibility checks

#### Build

```
make build env=production
```

#### Deployment

```
make deploy env=staging|production
```

Make sure that the following environment variables are available in your environment or in the `.env` file:

- `STAGING_DESTINATION_PATH`
- `STAGING_PUBLIC_URL`
- `PRODUCTION_DESTINATION_PATH`
- `PRODUCTION_PUBLIC_URL`

#### Update generated charts

```
make charts
```

#### Publish charts to a server

```
make charts-publish
```

Make sure that the following environment variables are available in your environment or in the `.env` file:

- `CHARTS_OUTPUT_DESTINATION_PATH`

## Editing Content

Content editing is mainly powered by `cabinet`, a JavaScript library which allows content to be loaded either from the local file system or from a GitHub repository. In development and staging environments, cabinet is enabled by default.

When the editor is logged in to GitHub, they can edit content files directly through GitHub's UI. Updated content is available immediately in a cabinet-enabled app without having to re-build it. This allows for fast, near-realtime editing with live previews on the staging server while keeping a complete Git history of all edits.

When the production app is built, content is loaded from the local file system instead, and never loaded from GitHub.

For an in-depth guide on how to edit the content, see [CONTENT-HOWTO.md](CONTENT-HOWTO.md).


## Interactive Documentation

In development mode, an interactive documentation built with [Catalog](https://interactivethings.github.io/catalog/) is available under [`/docs`](http://localhost:8080/docs).
