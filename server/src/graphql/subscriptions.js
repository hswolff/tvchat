import debugCreator from 'debug';
import { PubSub, SubscriptionManager } from 'graphql-subscriptions';

const debug = debugCreator('graphql/subscriptions');

export function createSubscriptionManager({ schema }) {
  const pubsub = new PubSub();
  const subscriptionManager = new SubscriptionManager({
    schema,
    pubsub,
    setupFunctions: {
      newChatMessage: (options, args) => ({
        newChatMessage: {
          // Only send if we're in the same show.
          filter: chatMessage => {
            debug('graphql/subscriptions newChatMessage filter');
            return chatMessage.show.id === args.showId;
          }
        }
      }),

      updatedChatUser: (options, args) => ({
        updatedChatUser: {
          // Only send if we're in the same show.
          filter: data => {
            debug('graphql/subscriptions updatedChatUser filter');
            return data.chatUser.show.id === args.showId;
          }
        }
      }),
    },
  });

  return {
    pubsub,
    subscriptionManager,
  };
}

export const subscriptionSchema = `
type Subscription {
  newChatMessage(showId: String!): ChatMessage!
  newChatUser(showId: String!, accessToken: String!): String!
  updatedChatUser(showId: String!): UpdatedChatUser!
  updatedUser: User!
}
`;

export const subscriptionResolver = {
  Subscription: {
    newChatMessage(chatMessage) {
      return chatMessage;
    },
    newChatUser() {
      return arguments;
    },
    updatedChatUser(data) {
      return data;
    },
    updatedUser(data) {
      return data;
    },
  },
};
