import {Map} from 'immutable';
import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducer';

export const configureStore = (configuration, {isLoggedIn, getApi}) => {
  const initialState = {cabinet: Map()};
  if (!(__CABINET_ENABLED__ && isLoggedIn)) {
    initialState.cabinet = initialState.cabinet.set('content', configuration.initialContent);
  }

  const store = createStore(
    combineReducers({
      ...configuration.redux.reducers,
      cabinet: reducer
    }),
    initialState,
    compose(
      applyMiddleware(
        ...[thunk.withExtraArgument({isLoggedIn, getApi}), ...configuration.redux.middlewares]
      ),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    )
  );

  return store;
};
