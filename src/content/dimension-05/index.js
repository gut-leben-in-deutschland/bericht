import Immutable from 'immutable';
import content from './content.js';

if (typeof window !== 'undefined') {
  window.__INITIAL_CABINET_CONTENT__ = (window.__INITIAL_CABINET_CONTENT__ || Immutable.Map()).merge(content);
}
