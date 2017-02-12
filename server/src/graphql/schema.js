import _ from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';
import debugCreator from 'debug';
import { authQuery, authMutation, authSchema, authResolver } from './auth-schema';
import { feedQuery, feedMutation, feedSchema, feedResolver } from './feed-schema';
import { showQuery, showMutation, showSchema, showResolver } from './show-schema';
import { subscriptionSchema, subscriptionResolver } from './subscriptions';

const debug = debugCreator('graphql/schema');

export const rootSchema = `
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}

type Query {
  chatMessages(showId: String!): [ChatMessage]!
  chatUsers(showId: String!): [ChatUser]
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
  user: User
  show: Show
  message: String!
  timestamp: Float!
}

type ChatUser {
  id: String!
  user: User
  show: Show
  timestamp: Float!
}

type UpdatedChatUser {
  chatUser: ChatUser!
  added: Boolean!
}
`;

export const rootResolver = {
  Query: {
    chatMessages(root, { showId }, { Models }) {
      const { ChatMessage } = Models;

      debug('query chatMessages');

      return ChatMessage
        .find({ show: showId })
        .populate('user show')
        .limit(1000)
        .sort({ timestamp: 1 });
    },
    chatUsers(root, { showId }, { Models }) {
      const {
        ChatUser,
      } = Models;

      debug('query chatUsers');

      return ChatUser
        .find({ show: showId })
        .populate('user show')
        .limit(1000)
        .sort({ timestamp: 1 });
    },
  },

  Mutation: {
    async createChatMessage(root, args, { credentials, Models, pubsub }) {
      if (credentials == null || credentials.id == null) {
        throw new Error('Not logged in.');
      }

      const { ChatMessage } = Models;

      debug('createChatMessage')
      let chatMessage = await ChatMessage.create(_.extend({}, args, {
        user: credentials.id,
        show: args.showId,
      }));

      debug('createChatMessage publish');
      chatMessage = await chatMessage.populate('user show').execPopulate();
      pubsub.publish('newChatMessage', chatMessage);

      return chatMessage;
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
