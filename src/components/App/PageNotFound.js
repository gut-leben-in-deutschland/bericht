import React from 'react';
import {config} from 'cabinet';
import Markdown from 'components/Markdown/Markdown';

const PageNotFound = () => (
  <Markdown src={`content/static/404/index.${config.locale}.md`} />
);

export default PageNotFound;

