import { PubSub, SubscriptionManager } from 'graphql-subscriptions';

export function createSubscriptionManager({ schema }) {
  const pubsub = new PubSub();
  const subscriptionManager = new SubscriptionManager({
    schema,
    pubsub,
    setupFunctions: {
      newChatMessage: (options, args) => ({
        newChatMessage: {
          // Only send if we're in the same showId.
          filter: chatMessage => chatMessage.showId.toString() === args.showId,
        }
      }),

      updatedChatUser: (options, args) => ({
        updatedChatUser: {
          // Only send if we're in the same showId.
          filter: data => data.chatUser.showId.toString() === args.showId,
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
