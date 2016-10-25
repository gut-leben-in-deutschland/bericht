# Editing Content

Content is written in [Markdown syntax](http://commonmark.org/help/) with some custom extensions for sections and charts.

In addition to Markdown files, there are some CSV files which need to be edited with a spreadsheet software like [LibreOffice](https://www.libreoffice.org/).

### Translations

Markdown files should be suffixed with their locale (`de` or `en`). Interface strings should be translated in `translations.tsv` which also exists as [Google spreadsheet](https://docs.google.com/spreadsheets/d/1mgVpucvi5VTVa0Zk3phTVCorNrmJQ-LBB99GfAEtgfM/edit) and can be automatically downloaded by running `make content`.

### File Structure

All editable content files are located in the `content/` directory. Dimension-related text, data and assets are grouped in their respective directories, named with the dimension ID (e.g. `content/01/`).

Files are named in the following pattern: `{name}.{locale}.{extension}`, where `{name}` is arbitrary, `{locale}` one of the supported locales (`de` or `en`), and the `{extension}` corresponds to the file type (`md`, `csv`, `tsv`, `jpg`, etc.).

Files related to _indicators_ are nested in the dimensions named with their respective ID, e.g. (`content/01/02`).

### Important Files

- `content/{dimensionID}/report.{locale}.md`: the main report chapter file
- `content/{dimensionID}/{indicatorID}/description.{locale}.md`: the indicator description which defines the content of the indicator detail page

#### Metadata

- `content/translations.tsv`: a mapping from translation keys to translated strings of text; used for all general user interface labels and routes (i.e. the translated part of the individual page URLs)
- `content/routes.tsv`: a mapping from route keys to content files
- `content/dimensions.{locale}.md`: dimension metadata, such as a mapping from ID to name
- `content/indicators.{locale}.md`: indicator metadata, such as a mapping from ID to name

### Structuring Content

In addition to basic Markdown features such as heading, paragraphs, lists etc. a few extensions are supported for custom layouting and charts.

```
# Big heading

A paragraph.

- A list item
- Another list item
```

#### Sub-/Superscript

```
An example of subscript is H<sub>2</sub>O, whereas m<sup>2</sup> uses superscript.
```

#### Footnotes

Footnotes almost look like link references, and consist of two parts:

1. A footnote reference: `[^1]`
2. A footnote definition: `[^1]: The content of my footnote`

The _identifier_ (the part in brackets) must be the same in the reference and the definition. Please use consecutive numbers only for identifiers.

The _definition_ can theoretically contain any Markdown, even multiple paragraphs and links.

Example:

```
Lorem ipsum dolor sit amet[^1], consectetur adipisicing[^2] elit. Neque, corporis?

[^1]:
  Lorem ipsum dolor sit amet, consectetur adipisicing elit.

  Obcaecati quo sit voluptates [veniam](http://veniam.org) delectus iste, voluptatibus consequatur aliquam necessitatibus facere.

[^2]: Lorem ipsum dolor.
```

#### Sections

To denote sections of text, a special syntax has to be used, which looks like a HTML comment:

```
Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos modi, hic ut est? Amet minus accusamus dolorum error est ratione, repudiandae dolore consequatur rem ducimus magnam voluptatum numquam sed, consequuntur.

<!-- MySection start -->

Lorem ipsum dolor sit amet.

<!-- MySection end -->
```

Here, the section is defined by two _section markers_. Section markers need a _name_ (`my-section` in above's example) and a `start` or `end` parameter.

```hint
NOTE: Each section marker needs a newline before and after it, otherwise it won't be detected.
```

#### Markers

Non-section markers don't (and shouldn't) use a `start` and `end` parameter. For example:

```
Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est, aut esse unde?

<!-- SomeMarker foo=bar -->

Officiis, odio, adipisci! Libero, optio tenetur explicabo laboriosam, quia doloribus fuga quis beatae ipsum nobis?
```

Markers can contain additional _parameters_ (`foo=bar` in above's example).

```hint
NOTE: All available sections and markers are defined and specific to where they show up:
```

#### Charts

Charts look like code blocks and can be included and customized anywhere.

````
```chart
01-01-a
```
````

You can include any chart by referring to it's id. Inline customization can be added, separated by three dashes, as a JSON object.

````
```chart
01-01-a
---
{
  "maxWidth": 610
}
```
````

#### Indicator Dashboard Section and Marker Types

##### `Prologue` Section

Description at the top of the indicator detail page. The first paragraph will always displayed, the rest can be shown on demand.

Example:

```
<!-- Prologue start -->

Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Autem delectus consectetur ipsa molestias corrupti assumenda voluptates voluptate, nisi sapiente temporibus!

<!-- Prologue end -->
```

##### `ChartList` Marker

Includes all charts of an indicator which are marked with `dashboard TRUE`.

Example:

```
<!-- ChartList -->
```

#### Report Sections (Generic)

##### `Prologue` Section

Introduction at the top of the report chapter page. The dimension title must _not_ be placed in the prologue, it will be inserted automatically.

```hint
NOTE: Only paragraphs are allowed in this section. Other content (e.g. lists) will be ignored!
```

Example:

```
<!-- Prologue start -->

Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Animi necessitatibus modi quod, hic nisi quisquam numquam voluptatum.

<!-- Prologue end -->
```

##### `ColumnContainer` Section

Wraps a `ColumnLeft` and `ColumnRight` section and ensures proper layout.

##### `ColumnLeft` Section

A 50% wide column on the left. Usually used for text next to a chart.

##### `ColumnRight` Section

A 50% wide column on the right. Usually used for a chart.

Example:

```
<!-- ColumnContainer start -->

<!-- ColumnLeft start -->

Lorem ipsum dolor sit **amet**, consectetur adipisicing elit.

Nemo commodi, magni laboriosam rem temporibus non cumque ipsam porro optio quisquam nulla sunt, ex provident illo magnam veniam. **Explicabo quisquam**, deleniti.

<!-- ColumnLeft end -->

<!-- ColumnRight start -->

I am a chart or something.

<!-- ColumnRight end -->

<!-- ColumnContainer end -->
```

##### `GovernmentMeasures` Section

The section to list government measures. Can contain Markdown paragraphs and a list of links.

Example:

```
<!-- GovernmentMeasures start -->

We're doing the following:

- [Foo](http://example.com)
- [Bar](http://example.com)

<!-- GovernmentMeasures end -->
```

##### `Quote` Marker

Needs a `text` and `source` parameter. These parameters only can contain plain text and no Markdown.

```hint
NOTE: Don't use Markdown blockquotes (lines starting with `>`).
```

Example:

```
<!-- Quote text='Ein Zitat von jemandem' source='Maria Jemand' -->
```

#### Report Sections (Flagship Visualizations)

##### `ScrollContainer*` Section

The specific flagship visualization, e.g. `DifferenceBarScrollContainer`, can contain `ScrollBlock` sections and personalization elements.

##### `ScrollBlock` Section

A `ScrollBlock` is a section of text which triggers a state in its parent `ScrollContainer` when it is scrolled into view. On mobile it will just display the text and a static view of the respective state, unless the global paramter `skipMobileVisualization` is set. Other possible state parameters are defined by the specific flagship containers.

Example:

```
<!-- FooScrollContainer start -->

<!-- ScrollBlock highlight='1,2,3' start -->

This section of text highlights the values 1, 2, and 3.

<!-- ScrollBlock end -->

<!-- ScrollBlock highlight='4,5,6' start -->

This section of text highlights the values 4, 5, and 6.

<!-- ScrollBlock end -->

<!-- ScrollBlock start skipMobileVisualization -->

This section of text show the visualization without highlights.

<!-- ScrollBlock end -->

<!-- FooScrollContainer end -->
```


##### Specific Flagship Containers

###### `DifferenceBarScrollContainer`

  + `ScrollBlock` parameters:
      * `stage`: `choropleth`, `dots`, `endValue`, `values`, `difference`
      * `highlights`: highlights data within the visualization, first 1 to 5 digits of an [AGS](https://de.wikipedia.org/wiki/Amtlicher_Gemeindeschl%C3%BCssel), multiple comma separated values are allowed
      * `tooltips`: force show tooltips, `user` or first 5 digits of an [AGS](https://de.wikipedia.org/wiki/Amtlicher_Gemeindeschl%C3%BCssel), multiple comma separated values are allowed
      * `yAxisLabel`: A y label in following format `value,label`
  + Personalization elements:
      * `LocationSelect` marker
      * `DistrictsStats` section

###### `PercentilesScrollContainer`

  + `ScrollBlock` parameters:
      * `stage`: `randomDistribution`, `sortedDots`, `bars`
      * `tooltips`: force show tooltips, `user`
  + Personalization elements:
      * `AnnualIncome` marker
      * `FamilySize` marker
      * `LeisureTime` marker

###### `MultiplePercentilesScrollContainer`

  + `ScrollBlock` parameters:
      * `stage`: `randomDistribution`, `sortedDots`, `bars`
      * `tooltips`: force show tooltips, `user`
  + Personalization elements:
      * `WorkingHours` marker
      * `WorkingHoursStats` marker

###### `MapDotsScrollContainer`

  + `ScrollBlock` parameters:
      * `stage`: `map`, `dots`, `groups`
  + Personalization elements:
      * `LocationSelect` marker
      * `No2Stats` section with sub elements:
          * `NoStations` section
          * `PersonalizedStationList` marker

##### `DownloadBlock` and `LinkBlock` Section

These sections should contain a list of links which will be separated by
horizontal lines. The two sections differ only by the icon which is shown
at the very right of each item.

The URL will be run through the translation engine, so make sure it's defined
in the translations.csv file.

```
<!--LinkBlock start-->

 - [Hier gehts zum Regierungsbericht](route/index)
 - [Bürgerdialog](link/citizens-dialogue/url)
 - [GitHub Repository](link/data-on-github/url)

<!--LinkBlock end-->
```
