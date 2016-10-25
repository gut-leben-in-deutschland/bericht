import React, {PropTypes} from 'react';
import Helmet from 'react-helmet';
import urlJoin from 'url-join';

const fullPublicPath = (path) => urlJoin(__WEBSITE_URL__, path);

// The full URL (including protocol and domain and path) of the given route.
export function routePublicURL(t, route) {
  return urlJoin(__WEBSITE_URL__.replace(__webpack_public_path__, ''), __webpack_public_path__, t(route.key), '/');
}

const PageHead = ({t, route, title, description, keywords, sharingImage}) => {
  const keywordsContent = keywords
    ? keywords.join(',')
    : t('meta/keywords');
  const descriptionContent = description
    ? description
    : t('meta/description');
  return (
    <Helmet
      title={title}
      meta={[
        {name: 'author', content: t('meta/author')},
        {name: 'keywords', content: keywordsContent},
        {name: 'description', content: descriptionContent},
        {name: 'og:type', content: 'website'},
        {name: 'og:url', content: routePublicURL(t, route)},
        {name: 'og:title', content: title},
        {name: 'og:description', content: descriptionContent},
        {name: 'og:image', content: fullPublicPath(sharingImage)},
        {name: 'twitter:card', content: 'summary_large_image'},
        {name: 'twitter:site', content: '@RegSprecher'},
        {name: 'twitter:creator', content: '@RegSprecher'},
      ]}
    />
  );
};

PageHead.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.array,
  route: PropTypes.object.isRequired,
  sharingImage: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired
};

export default PageHead;
