import React from 'react';
import ReactDOM from 'react-dom';
// Redux
import createStore from './data/create-store';
import {
  getAccessToken,
  hydrateViewer,
} from './data/modules/viewer';
// Apollo
import ApolloClient, {
  createNetworkInterface,
  addTypename,
} from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { Client } from 'subscriptions-transport-ws';
// Router
import createHistory from 'history/lib/createBrowserHistory';
import {
  Router,
  applyRouterMiddleware,
  useRouterHistory,
 } from 'react-router';
import { useScroll } from 'react-router-scroll';
import useNamedRoutes from 'use-named-routes';

function createApolloClient() {
  const networkInterface = createNetworkInterface({
    uri: 'http://localhost:4000/graphql',
    // transportBatching: true,
  });

  const client = new ApolloClient({
    networkInterface,
    queryTransformer: addTypename,
    dataIdFromObject: (result) => {
      if (result.id && result.__typename) {
        return result.__typename + result.id;
      }
      return null;
    },
  });

  networkInterface.use([{
    applyMiddleware(req, next) {
      if (!req.options.headers) {
        req.options.headers = {};  // Create the header object if needed.
      }

      // eslint-disable-next-line no-use-before-define
      req.options.headers.authorization = getAccessToken(store.getState());
      next();
    },
  }]);

  const wsClient = new Client('ws://localhost:8080');

  // Source: https://github.com/apollostack/GitHunt-React/blob/master/ui/helpers/subscriptions.js
  function addGraphQLSubscriptions(networkInterface, wsClient) {
    return Object.assign(networkInterface, {
      subscribe: (request, handler) => wsClient.subscribe(request, handler),
      unsubscribe: (id) => wsClient.unsubscribe(id),
    });
  }

  addGraphQLSubscriptions(networkInterface, wsClient);

  client.wsClient = wsClient;

  return client;
}

const client = createApolloClient();

const store = createStore({
  reducers: {
    apollo: client.reducer(),
  },
  middleware: [client.middleware()],
});
store.dispatch(hydrateViewer());

const historyCreator = useNamedRoutes(useRouterHistory(createHistory));
const routerRender = applyRouterMiddleware(useScroll());

const rootEl = document.getElementById('root');

function render() {
  const getRoutes = require('./routes').default;
  const routes = getRoutes();

  ReactDOM.render(
    <ApolloProvider store={store} client={client}>
      <Router
        routes={routes}
        history={historyCreator({ routes })}
        render={routerRender}
      />
    </ApolloProvider>,
    rootEl
  );
}

render();

// if (module.hot) {
//   module.hot.accept('./routes', () => {
//     setTimeout(render);
//   });
// }
