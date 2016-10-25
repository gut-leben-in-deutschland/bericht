import {contentFromRequireContext} from 'cabinet';

export default contentFromRequireContext({
  markdown: require.context('!!../../../cabinet/markdown/loader!content/02', true, /.*\.md$/),
  image: require.context('content/02', true, /.*\.(jpe?g|gif|png|svg)$/),
  dsv: require.context('content/02', true, /.*\.(t|c)sv$/),
  basePath: '02'
});
