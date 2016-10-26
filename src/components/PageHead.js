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
        {property: 'og:type', content: 'website'},
        {property: 'og:url', content: routePublicURL(t, route)},
        {property: 'og:title', content: title},
        {property: 'og:description', content: descriptionContent},
        {property: 'og:image', content: fullPublicPath(sharingImage)},
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
