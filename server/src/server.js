import hapi from 'hapi';
import authJwt2 from 'hapi-auth-jwt2';
import { isTokenValid } from './auth';
import createDbConnection from './db';
import graphql from './graphql';

export default async function createServer() {
  await createDbConnection();

  // Create hapi server.
  const server = new hapi.Server();
  server.connection({ port: process.env.PORT });

  await server.register([
    authJwt2,
  ]);

  server.auth.strategy('jwt', 'jwt', {
    key: process.env.JWT_SECRET,
    validateFunc(decoded, request, callback) {
      callback(null, isTokenValid(decoded));
    },
    verifyOptions: {
      algorithms: ['HS256'],
    },
  });

  server.auth.default({
    strategy: 'jwt',
    mode: 'try',
  });

  await graphql(server);

  server.route({
    method: 'GET',
    path: '/',
    handler(request, reply) {
      reply('Hello World!');
    }
  });

  server.route({
    method: 'GET',
    path: '/restricted',
    config: {
      auth: {
        strategy: 'jwt',
        access: {
          scope: ['admin'],
        },
      },
    },
    handler(request, reply) {
      reply({ text: 'You used a Token!' });
    },
  });

  await server.start();

  console.info('Server running at:', server.info.uri);

  return server;
}
