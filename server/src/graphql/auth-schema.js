import _ from 'lodash';
import debugCreator from 'debug';
import {
  verifyAndValidateToken,
  createRefreshToken,
  createToken,
  validatePassword,
} from '../auth';

const debug = debugCreator('graphql/auth-schema');

export const authQuery = `
viewer(accessToken: String): Viewer
`;

export const authMutation = `
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
`;

export const authSchema = `
enum GrantType {
  password
  refreshToken
}

type JWT {
  accessToken: String!
  accessTokenExpiration: Float!
  refreshToken: String!
}

interface Identity {
  id: String!
  email: String
  username: String!
  dateCreated: Float!
}

type User implements Identity {
  id: String!
  email: String
  username: String!
  dateCreated: Float!
}

type Viewer implements Identity {
  id: String!
  email: String
  username: String!
  dateCreated: Float!
}
`;

export const authResolver = {
  Query: {
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

    async updateUser(root, args, { credentials, Models, pubsub }) {
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
        debug('createToken refreshToken')

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
        debug('createToken password')

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
          debug('createToken refreshToken already exists')

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
};
