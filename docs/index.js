const {css} = require('aphrodite');
const parseMarkdown = require('cabinet/markdown/parse');

/**
 * Documentation
 *
 * This is the Catalog style guide module. It is meant to be required asynchronously
 * to prevent Catalog from bloating the application source code. In many situations
 * it might even be desirable to exclude the style guide from production completely.
 * In that case decide whether to require this file using the __DEV__ global.
 */
module.exports = (basePath, config) => (location, callback) => {
  require.ensure([], () => {
    const {configureRoutes} = require('catalog');
    const buttonLinkStyles = require('components/ButtonLink/Styles').default;
    const colorStyles = require('theme/colors');

    const catalogRoutes = configureRoutes({
      title: 'Quality of Life in Germany',
      basePath: basePath,
      logoSrc: require('theme/images/logo.svg'),
      imports: config.imports,
      theme: {
        brandColor: '#555',
        sidebarColorText: '#888',
        sidebarColorTextActive: '#000',
        pageHeadingTextColor: '#555',
        pageHeadingBackground: 'linear-gradient(to left, rgba(0,0,0,0) 0%,rgba(240,240,240,1) 100%)'
      },
      pages: [
        {title: 'Introduction', path: '/', component: require('../README.md')},
        {title: 'Content', path: '/content', component: require('../CONTENT-HOWTO.md')},
        {title: 'Components', pages: [
          {title: 'Header',
           path: 'header',
           component: require('components/Header/Header.docs.md'),
           imports: {
             Header: require('components/Header/Header'),
             Menu: require('components/Header/Menu'),
             Link: require('components/ButtonLink/Link')
           }
          },
          {title: 'Footer',
           path: 'footer',
           component: require('components/Footer/Footer.docs.md'),
           imports: {Footer: require('components/Footer/Footer')}
          },
          {title: 'Share',
           path: 'share',
           component: require('components/Share/Share.docs.md'),
           imports: {
             ...require('components/Share/Share'),
             ShareLink: require('components/Share/ShareLink')
           }
         },
          {title: 'Heading',
           path: 'heading',
           component: require('components/Heading/Heading.docs.md'),
           imports: {Heading: require('components/Heading/Heading')}
          },
          {title: 'Button',
           path: 'button',
           component: require('components/ButtonLink/Button.docs.md'),
           imports: {
             ...buttonLinkStyles, ...colorStyles, css,
             Button: require('components/ButtonLink/Button'),
           }
          },
          {title: 'Link',
           path: 'link',
           component: require('components/ButtonLink/Link.docs.md'),
           imports: {
             Link: require('components/ButtonLink/Link'),
             Link16: require('components/ButtonLink/Link').Link16,
             Link18: require('components/ButtonLink/Link').Link18,
           }
          },
          {title: 'Navigation',
           path: 'navigation',
           component: require('components/Navigation/Navigation.docs.md'),
           imports: {
             ...require('components/Navigation/StickyNavBar'),
             ...require('components/Navigation/BottomNavBar')
           }
          },
          {title: 'ChapterMenu',
           path: 'chapter-menu',
           component: require('components/ChapterMenu/Menu.docs.md'),
           imports: {
             ...require('components/ChapterMenu/MenuPreview'),
           },
          },
          {title: 'ChapterMenuBar',
           path: 'chapter-menu-bar',
           component: require('components/ChapterMenu/Bar.docs.md'),
           imports: {
             ...require('components/ChapterMenu/BarPreview'),
           },
          },
          {title: 'SearchBar',
           path: 'searchbar',
           component: require('components/Indicator/SearchBar.docs.md'),
           imports: {
             ...require('components/Indicator/SearchBarPreview'),
             SearchBar: require('components/Indicator/SearchBar'),
           },
          },
          {title: 'LoadingIndicator',
           path: 'loading-indicator',
           component: require('components/LoadingIndicator/LoadingIndicator.docs.md'),
           imports: {LoadingIndicator: require('components/LoadingIndicator/LoadingIndicator')}
          },
          {title: 'Footnotes',
           path: 'footnotes',
           component: require('components/Footnotes/Footnotes.docs.md'),
           imports: {
             ...require('components/Footnotes/Footnotes'),
             parseMarkdown
           }
          },
          {title: 'Indicators',
           path: 'indicators',
           component: require('components/Indicator/Overview.docs.md'),
           imports: {
             ...require('components/Indicator/Header'),
             ...require('components/Indicator/Overview'),
             ...require('components/Indicator/Overview/Card')
           }
         },
         {title: 'FencedItemList',
          path: 'fenced-item-list',
          component: require('components/FencedItemList/FencedItemList.docs.md'),
          imports: {
            ...require('components/FencedItemList/FencedItemList'),
          },
         },
         {title: 'Report Intro',
          path: 'report-intro',
          component: require('components/Report/Intro.docs.md'),
          imports: {
            Intro: require('components/Report/Intro'),
            shortIntroContent: {
              type: 'zone',
              name: 'Prologue',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {type: 'text', value: 'Lorem ipsum dolor sit amet.'}
                  ]
                },
                {
                  type: 'paragraph',
                  children: [
                    {type: 'text', value: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Excepturi, deleniti, at.'}
                  ]
                }
              ]
            },
            longIntroContent: {
              type: 'zone',
              name: 'Prologue',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {type: 'text', value: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reprehenderit fugit nostrum in atque voluptatum rerum, aperiam, facere minus vero a laborum labore quidem repellat accusamus. Incidunt quasi, enim ullam atque quis consectetur.'}
                  ]
                },
                {
                  type: 'paragraph',
                  children: [
                    {type: 'text', value: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et nobis, sit possimus, quisquam laborum neque debitis impedit dolor vitae facere. Maxime nostrum obcaecati ut nisi atque fuga.'}
                  ]
                }
              ]
            }
          }
         },
         {title: 'Report Government Measures',
          path: 'report-government-measures',
          component: require('components/Report/GovernmentMeasures.docs.md'),
          imports: {
            GovernmentMeasures: require('components/Report/GovernmentMeasures'),
            content: {
              type: 'zone',
              name: 'GovernmentMeasures',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {type: 'text', value: 'Lorem ipsum dolor sit amet.'}
                  ]
                },
                {
                  type: 'list',
                  children: [
                    {
                      type: 'listItem',
                      children: [
                        {
                          type: 'paragraph',
                          children: [
                            {
                              type: 'link',
                              url: '#',
                              children: [
                                {type: 'text', value: 'Lorem ipsum dolor'}
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      type: 'listItem',
                      children: [
                        {
                          type: 'paragraph',
                          children: [
                            {
                              type: 'link',
                              url: '#',
                              children: [
                                {type: 'text', value: 'Lorem ipsum dolor'}
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
         }
        ].sort((a, b) => a.title < b.title ? -1 : 1)
       },
       {title: 'Landing Page', pages: [
         {title: 'Desktop',
          path: 'landing-page/desktop',
          component: require('components/LandingPage/DesktopLandingPage.docs.md'),
          imports: {
            ...require('components/LandingPage/Desktop/DesktopLandingPageVisualizationPreview'),
            ...require('components/LandingPage/Desktop/DesktopDetailViewPreview'),
            ...require('components/LandingPage/Desktop/TableOfContentsHeading'),
            ...require('components/LandingPage/Desktop/TableOfContentsPreview'),
          }
        },
        {title: 'Mobile',
         path: 'landing-page/mobile',
         component: require('components/LandingPage/MobileLandingPage.docs.md'),
         imports: {
           ...require('components/LandingPage/Mobile/CardListPreview'),
           ...require('components/LandingPage/Mobile/Menu'),
           ...require('components/LandingPage/Mobile/MobileDetailViewPreview'),
         }
        }
       ]},
        {title: 'Flagship', pages: [
          {title: 'Difference Bar',
           path: 'flagship/difference-bar',
           component: require('components/Flagship/DifferenceBars/Visualization.docs.md'),
           imports: {
             ...require('components/Flagship/DifferenceBars/VisualizationPreview'),
           },
          },
          {title: 'Family Size',
           path: 'flagship/family-size',
           component: require('components/Flagship/Percentiles/FamilySize.docs.md'),
           imports: {
             FamilySize: require('components/Flagship/Percentiles/FamilySize').default,
           },
         },
         {title: 'Annual Income',
          path: 'flagship/annual-income',
          component: require('components/Flagship/Percentiles/AnnualIncome.docs.md'),
          imports: {
            AnnualIncome: require('components/Flagship/Percentiles/AnnualIncome').default,
          },
        },
        {title: 'Leisure Time',
         path: 'flagship/leiure-time',
         component: require('components/Flagship/Percentiles/LeisureTime.docs.md'),
         imports: {
           LeisureTime: require('components/Flagship/Percentiles/LeisureTime').default,
         },
        }
        ]},
        {
          title: 'Layout',
          pages: [
            {
              title: 'Grid',
              path: 'layout/grid',
              component: require('components/Grid/Grid.docs.md'),
              imports: {
                Container: require('components/Grid/Grid').Container,
                Grid: require('components/Grid/Grid').Grid,
                Span: require('components/Grid/Grid').Span
              }
            }
          ]
        },
        {title: 'Helpers', path: '/helpers', component: require('../src/theme/helpers.docs.md')},
        {title: 'Theme', pages: [
          {title: 'Colors', path: 'colors', component: require('../src/theme/colors.docs')},
          {title: 'Typeface', path: 'typeface', component: require('../src/theme/typeface.docs')},
          {title: 'Media Queries', path: 'media-queries', component: require('../src/theme/mediaQueries.docs.md')}
        ]},
        {title: 'Charts', pages: [
          {title: 'Bars', path: 'charts/bars', component: require('components/Chart/Bars.docs')},
          {title: 'Lollipops', path: 'charts/lollipops', component: require('components/Chart/Lollipops.docs')},
          {title: 'Lines', path: 'charts/lines', component: require('components/Chart/Lines.docs')},
          {title: 'Box Plots', path: 'charts/box-plots', component: require('components/Chart/BoxPlots.docs')},
          {title: 'Maps', path: 'charts/maps', component: require('components/Chart/Maps.docs')},
          {title: 'Misc', path: 'charts/misc', component: require('components/Chart/Misc.docs')}
        ]}
      ]
    });

    callback(null, catalogRoutes);
  }, 'catalog');
};
