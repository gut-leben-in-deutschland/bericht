import {contentFromRequireContext} from 'cabinet';

export default contentFromRequireContext({
  markdown: require.context('!!../../../cabinet/markdown/loader!content/11', true, /.*\.md$/),
  image: require.context('content/11', true, /.*\.(jpe?g|gif|png|svg)$/),
  dsv: require.context('content/11', true, /.*\.(t|c)sv$/),
  basePath: '11'
});
