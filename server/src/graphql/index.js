import _ from 'lodash';
import { graphqlHapi, graphiqlHapi } from 'graphql-server-hapi';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { createServer } from 'http';
import { subscriptionManager, pubsub } from './subscriptions';
import Models from '../models';
import { verifyToken } from '../auth';
import schema from './schema';

const WS_PORT = process.env.WS_PORT || 8080;

export default async function graphql(server) {
  await server.register({
    register: graphqlHapi,
    options: {
      path: '/graphql',
      route: {
        cors: true,
      },
      graphqlOptions: (request) => {
        const options = {
          schema,
          context: {
            Models,
          },
        };

        return new Promise(resolve => {
          request.server.auth.test('jwt', request, (err, credentials) => {
            // Add decoded jwt to context.
            if (credentials) {
              options.context.credentials = credentials;
            }

            resolve(options);
          });
        });
      },
    },
  });

  await server.register({
    register: graphiqlHapi,
    options: {
      path: '/graphiql',
      graphiqlOptions: {
        endpointURL: '/graphql',
      },
    },
  });

  // WebSocket server for subscriptions
  const websocketServer = createServer((request, response) => {
    response.writeHead(404);
    response.end();
  });

  websocketServer.listen(WS_PORT, () => console.log( // eslint-disable-line no-console
    `Websocket Server is now running on http://localhost:${WS_PORT}`
  ));

  const unsubIdToUserId = {};

  const origSubscribe = subscriptionManager.subscribe;
  subscriptionManager.subscribe = async function (options) {
    // console.log('hello', options);
    if (options.operationName !== 'newChatUser') {
      return origSubscribe.apply(this, arguments);
    }

    const origValue = await origSubscribe.apply(this, arguments);

    const {
      accessToken,
      showId,
    } = options.variables;
    const jwt = await verifyToken(accessToken);
    const userId = _.get(jwt, 'id');
    if (!userId) {
      return origValue;
    }

    const chatUser = new Models.ChatUser({ userId, showId });
    chatUser._id = undefined;
    const newChatUser =  await Models.ChatUser
      .findOneAndUpdate({ userId }, chatUser, { upsert: true, new: true })
    pubsub.publish('updatedChatUser', {
      added: true,
      chatUser: newChatUser
    });

    unsubIdToUserId[origValue] = userId;

    return origValue;
  }

  const origUnsubscribe = subscriptionManager.unsubscribe;
  subscriptionManager.unsubscribe = async function (subId) {
    const userId = unsubIdToUserId[subId];
    if (userId != null) {
      const chatUser = await Models.ChatUser.findOne({ userId });
      pubsub.publish('updatedChatUser', {
        added: false,
        chatUser,
      });
      delete unsubIdToUserId[subId];
      await Models.ChatUser.remove({ userId });
    }

    return origUnsubscribe.apply(this, arguments);
  }

  new SubscriptionServer({
    subscriptionManager,
    onSubscribe(msg, params) {
      return Object.assign({}, params, {
        context: {
          Models,
        },
      });
    }
  }, websocketServer);
}
