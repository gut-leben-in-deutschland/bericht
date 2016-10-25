import {createSelectorCreator, defaultMemoize} from 'reselect';
import {shallowEqual} from 'utils/shallowEqual';

export default createSelectorCreator(
  defaultMemoize,
  shallowEqual
);
