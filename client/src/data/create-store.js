import {
  createStore as reduxCreateStore,
  applyMiddleware,
  compose,
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise';
import { persistStore, autoRehydrate } from 'redux-persist';
import createRootRecuer from './modules';

export default function createStore({
  initialState = {},
  reducers = {},
  middleware = [],
}) {
  let enhancer = compose(
    applyMiddleware(thunkMiddleware, promiseMiddleware, ...middleware),
    autoRehydrate()
  );

  if (window.devToolsExtension) {
    enhancer = compose(
      enhancer,
      window.devToolsExtension()
    );
  }

  const store = reduxCreateStore(
    createRootRecuer(reducers),
    initialState,
    enhancer
  );

  // Persist store in browser w/ redux-persist.
  persistStore(store, {
    debounce: 500,
    whitelist: ['viewer'],
  });

  return store;
}
