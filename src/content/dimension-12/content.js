import {contentFromRequireContext} from 'cabinet';

export default contentFromRequireContext({
  markdown: require.context('!!../../../cabinet/markdown/loader!content/12', true, /.*\.md$/),
  image: require.context('content/12', true, /.*\.(jpe?g|gif|png|svg)$/),
  dsv: require.context('content/12', true, /.*\.(t|c)sv$/),
  basePath: '12'
});
