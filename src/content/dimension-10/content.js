import {contentFromRequireContext} from 'cabinet';

export default contentFromRequireContext({
  markdown: require.context('!!../../../cabinet/markdown/loader!content/10', true, /.*\.md$/),
  image: require.context('content/10', true, /.*\.(jpe?g|gif|png|svg)$/),
  dsv: require.context('content/10', true, /.*\.(t|c)sv$/),
  basePath: '10'
});
