import { PubSub, SubscriptionManager } from 'graphql-subscriptions';
import schema from './schema';

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

export { subscriptionManager, pubsub };
