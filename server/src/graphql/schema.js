import _ from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';
import {
  verifyAndValidateToken,
  createRefreshToken,
  createToken,
  validatePassword,
} from '../auth';
import { pubsub } from './subscriptions';

export const typeDefs = `
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}

type Subscription {
  newChatMessage(showId: String!): ChatMessage!
  newChatUser(showId: String!, accessToken: String!): String!
  updatedChatUser(showId: String!): UpdatedChatUser!
  updatedUser: User!
}

type Query {
  shows(slug: String): [Show]!
  chatMessages(showId: String!): [ChatMessage]!
  chatUsers(showId: String!): [ChatUser]!
  viewer(accessToken: String): Viewer
}

enum GrantType {
  password
  refreshToken
}

type Mutation {
  createChatMessage(
    showId: String!
    message: String!
  ): ChatMessage!

  createShow(
    name: String!
    slug: String!
  ): Show

  createToken(
    grantType: GrantType!
    email: String
    username: String
    password: String
    refreshToken: String
  ): JWT

  # Creates a user.
  createUser(
    username: String!
    email: String
    password: String
  ): JWT

  # Update a user, based on the accessToken, either given from Header or
  # from passed in arg.
  updateUser(
    username: String
    email: String
    password: String
    accessToken: String
  ): Viewer

  revokeToken(
    refreshToken: String!
  ): String
}

interface Identity {
  id: String
  email: String
  username: String
  dateCreated: Float
}

type User implements Identity {
  id: String
  email: String
  username: String
  dateCreated: Float
}

type Viewer implements Identity {
  id: String
  email: String
  username: String
  dateCreated: Float
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

type Show {
  id: ID!
  name: String!
  slug: String!
  dateCreated: Float!
}

type JWT {
  accessToken: String!
  accessTokenExpiration: Float!
  refreshToken: String!
}
`;

export const resolvers = {
  Query: {
    async shows(root, args, { Models }) {
      if (args.slug != null) {
        let show;
        try {
          show = await Models.Show.findOne(args);
          return [show];
        } catch (e) {
          throw e;
        }
      }

      try {
        const shows = await Models.Show.find();
        return shows;
      } catch (e) {
        throw e;
      }
    },
    async chatMessages(root, { showId }, { Models }) {
      const {
        ChatMessage,
      } = Models;

      return await ChatMessage
        .find({ showId })
        .limit(1000)
        .sort({ timestamp: 1 });
    },
    async chatUsers(root, { showId }, { Models }) {
      const {
        ChatUser,
      } = Models;

      return await ChatUser
        .find({ showId })
        .limit(1000)
        .sort({ timestamp: 1 });
    },
    async viewer(root, { accessToken }, { credentials, Models }) {
      const {
        User,
      } = Models;

      let args;

      if (accessToken != null) {
        args = await verifyAndValidateToken(accessToken);
      } else if (credentials) {
        args = credentials;
      }

      if (args && args.id) {
        const user = await User.findById(args.id);
        return _.extend({
          username: '',
          email: '',
        }, user);
      }

      return null;
    },
  },

  Mutation: {
    async createChatMessage(root, args, { credentials, Models }) {
      if (credentials == null || credentials.id == null) {
        throw new Error('Not logged in.');
      }

      const {
        ChatMessage,
      } = Models;

      const chatMessage = await ChatMessage.create(_.extend({}, args, {
        userId: credentials.id,
      }));

      pubsub.publish('newChatMessage', chatMessage);

      return chatMessage;
    },

    async createShow(root, args, { Models }) {
      const show = await Models.Show.create(args);
      return show;
    },

    async createUser(root, args, { Models }) {
      const {
        RefreshToken,
        User,
      } = Models;

      const user = await User.create(args);

      const { accessToken, accessTokenExpiration } = createToken(user);
      const refreshToken = createRefreshToken();

      await RefreshToken.create({
        _id: refreshToken,
        userId: user.id,
      });

      return {
        accessToken,
        accessTokenExpiration,
        refreshToken,
      };
    },

    async updateUser(root, args, { credentials, Models }) {
      const {
        accessToken,
      } = args;
      const {
        User,
      } = Models;

      let userId;
      if (accessToken != null) {
        const decoded = await verifyAndValidateToken(accessToken);
        userId = decoded.id;
      } else if (credentials) {
        userId = credentials.id;
      }

      [
        'username',
        'email',
        'password',
      ].forEach(prop => {
        if (args[prop] === '') {
          delete args[prop];
        }
      });

      const newUser = await User.findByIdAndUpdate(userId, args, { new: true });

      pubsub.publish('updatedUser', newUser);

      return newUser;
    },

    async createToken(root, args, { Models }) {
      const {
        RefreshToken,
        User,
      } = Models;
      const {
        grantType,
        refreshToken,
        password,
      } = args;

      if (grantType === 'refreshToken') {
        const refreshTokenFromDb = await RefreshToken.findOne({
          _id: refreshToken,
        });

        if (refreshTokenFromDb == null) {
          throw new Error('Invalid refresh token.');
        }

        if (refreshTokenFromDb.dateExpires < Date.now()) {
          throw new Error('Token expired.');
        }

        const user = await User.findOne({
          _id: refreshTokenFromDb.userId,
        });

        const { accessToken, accessTokenExpiration } = createToken(user);

        return {
          accessToken,
          accessTokenExpiration,
          refreshToken: refreshTokenFromDb.id,
        };
      }

      if (grantType === 'password') {
        const user = await User.findOne(_.pick(args, 'username', 'email'));

        if (!user) {
          throw new Error('User does not exist.');
        }

        if (!validatePassword(password, user.password)) {
          throw new Error('Incorrect password.');
        }

        const { accessToken, accessTokenExpiration } = createToken(user);
        const newRefreshToken = createRefreshToken();
        try {
          await RefreshToken.create({
            _id: newRefreshToken,
            userId: user.id,
          });
        } catch (e) {
          if (e.message === 'RefreshToken already exists.') {
            await RefreshToken.remove({
              userId: user.id,
            });

            await RefreshToken.create({
              _id: newRefreshToken,
              userId: user.id,
            });
          } else {
            throw e;
          }
        }

        return {
          accessToken,
          accessTokenExpiration,
          refreshToken: newRefreshToken,
        };
      }

      return {};
    },

    async revokeToken(root, args, { Models }) {
      const {
        RefreshToken,
      } = Models;
      const {
        refreshToken,
      } = args;

      const result = await RefreshToken.remove({
        _id: refreshToken,
      });

      return _.get(result, 'result.ok', 0) === 1 ? 'success' : 'error';
    },
  },
  ChatMessage: {
    async user(data, args, { Models }) {
      const {
        User,
      } = Models;

      return await User.findOne({ _id: data.userId });
    },
  },
  ChatUser: {
    async user(data, args, { Models }) {
      const {
        User,
      } = Models;

      return await User.findOne({ _id: data.userId });
    },
  },
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
  }
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
