import PropTypes from 'prop-types';
import React from 'react';
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
    <Helmet>
      <title>{title}</title>
      <meta name='author' content={t('meta/author')} />
      <meta name='keywords' content={keywordsContent} />
      <meta name='description' content={descriptionContent} />
      <meta property='og:type' content={'website'} />
      <meta property='og:url' content={routePublicURL(t, route)} />
      <meta property='og:title' content={title || t('title')} />
      <meta property='og:description' content={descriptionContent} />
      <meta property='og:image' content={fullPublicPath(sharingImage)} />
      <meta name='twitter:card' content={'summary_large_image'} />
      <meta name='twitter:site' content={'@RegSprecher'} />
      <meta name='twitter:creator' content={'@RegSprecher'} />
    </Helmet>
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
