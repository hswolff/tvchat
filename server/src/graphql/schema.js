import _ from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';
import { authQuery, authMutation, authSchema, authResolver } from './auth-schema';
import { feedQuery, feedMutation, feedSchema, feedResolver } from './feed-schema';
import { showQuery, showMutation, showSchema, showResolver } from './show-schema';
import { subscriptionSchema, subscriptionResolver } from './subscriptions';

export const rootSchema = `
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}

type Query {
  chatMessages(showId: String!): [ChatMessage]!
  chatUsers(showId: String!): [ChatUser]!
  ${showQuery}
  ${authQuery}
  ${feedQuery}
}

type Mutation {
  createChatMessage(
    showId: String!
    message: String!
  ): ChatMessage!

  ${authMutation}
  ${feedMutation}
  ${showMutation}
}

type ChatMessage {
  id: ID!
  userId: String!
  user: User
  showId: String!
  message: String!
  timestamp: Float!
}

type ChatUser {
  id: String!
  userId: String!
  user: User
  showId: String!
  timestamp: Float!
}

type UpdatedChatUser {
  chatUser: ChatUser!
  added: Boolean!
}
`;

export const rootResolver = {
  Query: {
    async chatMessages(root, { showId }, { Models }) {
      const ChatMessage = Models.ChatMessageRoot.createNamespacedModel(showId);

      return await ChatMessage
        .find()
        .limit(1000)
        .sort({ timestamp: 1 });
    },
    async chatUsers(root, { showId }, { Models }) {
      const {
        ChatUser,
      } = Models;

      return await ChatUser
        .find()
        .limit(1000)
        .sort({ timestamp: 1 });
    },
  },

  Mutation: {
    async createChatMessage(root, args, { credentials, Models, pubsub }) {
      if (credentials == null || credentials.id == null) {
        throw new Error('Not logged in.');
      }

      const ChatMessage = Models.ChatMessageRoot.createNamespacedModel(args.showId);

      const chatMessage = await ChatMessage.create(_.extend({}, args, {
        userId: credentials.id,
      }));

      pubsub.publish('newChatMessage', chatMessage);

      return chatMessage;
    },
  },
  ChatMessage: {
    async user(data, args, { Models }) {
      const {
        User,
      } = Models;

      return User.findOne({ _id: data.userId });
    },
  },
  ChatUser: {
    async user(data, args, { Models }) {
      const {
        User,
      } = Models;

      return User.findOne({ _id: data.userId });
    },
  },
};

export default makeExecutableSchema({
  typeDefs: [
    rootSchema,
    subscriptionSchema,
    authSchema,
    feedSchema,
    showSchema,
  ],
  resolvers: _.merge(
    rootResolver,
    subscriptionResolver,
    authResolver,
    feedResolver,
    showResolver
  ),
});
