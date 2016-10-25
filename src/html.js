/* eslint camelcase: 0 */
// Export CommonJS because we use this file directly from the webpack config too!
module.exports = (assets, content, css, head) => {
  const styleLink = assets.style
    ? `<link rel="stylesheet" href="${__webpack_public_path__ + assets.style}" />`
    : '';

  const dimensionContent = assets.dimensionContent
    ? `<script src="${assets.dimensionContent}"></script>`
    : '';

  const html = `<!doctype html>
<html ${head.htmlAttributes}>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="google-site-verification" content="2t9WEhPAySSVleY-mYTaBe-0maT6ALpmE0EMeMpKHZ8" />
  ${head.title}
  ${head.meta}
  ${head.link}
  ${styleLink}
  <style data-aphrodite>${css.content}</style>
  <!-- Piwik -->
  <script type="text/javascript">
    var _paq = _paq || [];
    _paq.push(['enableLinkTracking']);
    (function() {
      var u="//piwik.bpa2011.bundesregierung.de/";
      _paq.push(['setTrackerUrl', u+'piwik.php']);
      _paq.push(['setSiteId', 68]);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
    })();
  </script>
  <!-- End Piwik Code -->
</head>
<body>
  <div id="app">${content || ''}</div>
  <script src="${assets.common}"></script>${dimensionContent}
  <script src="${assets.app}"></script>

  <!-- Piwik -->
  <noscript><p><img src="//piwik.bpa2011.bundesregierung.de/piwik.php?idsite=68" style="border:0;" alt="" /></p></noscript>
  <!-- End Piwik Code -->
</body>
</html>
`;

  return html;
};
