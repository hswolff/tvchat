import _ from 'lodash';
import { graphqlHapi, graphiqlHapi } from 'graphql-server-hapi';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { createServer } from 'http';
import { createSubscriptionManager } from './subscriptions';
import Models from '../models';
import { verifyToken } from '../auth';
import schema from './schema';

export default async function graphql(server) {
  const { subscriptionManager, pubsub } = createSubscriptionManager({ schema });

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
            pubsub,
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

  websocketServer.listen(process.env.WS_PORT, () => console.log( // eslint-disable-line no-console
    `Websocket Server is now running on http://localhost:${process.env.WS_PORT}`
  ));

  const unsubIdToUserId = {};

  const origSubscribe = subscriptionManager.subscribe;
  subscriptionManager.subscribe = async function (options) {
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

    const ChatUser = Models.ChatUserRoot.createNamespacedModel(showId);

    const chatUser = new ChatUser({ userId, showId });
    chatUser._id = undefined;
    const newChatUser =  await ChatUser
      .findOneAndUpdate({ userId }, chatUser, { upsert: true, new: true })
    pubsub.publish('updatedChatUser', {
      added: true,
      chatUser: newChatUser
    });

    unsubIdToUserId[origValue] = {
      userId,
      showId,
    };

    return origValue;
  }

  const origUnsubscribe = subscriptionManager.unsubscribe;
  subscriptionManager.unsubscribe = async function (subId) {
    const subObject = unsubIdToUserId[subId];
    if (!subObject) {
      return;
    }
    const { userId, showId } = subObject;
    const ChatUser = Models.ChatUserRoot.createNamespacedModel(showId);
    if (userId != null) {
      const chatUser = await ChatUser.findOne({ userId });
      pubsub.publish('updatedChatUser', {
        added: false,
        chatUser,
      });
      delete unsubIdToUserId[subId];
      await ChatUser.remove({ userId });
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
