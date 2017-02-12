import gql from 'graphql-tag';

export const mutations = {
  createToken: gql`
    mutation (
      $grantType: GrantType!,
      $refreshToken: String,
    ) {
      createToken(
        grantType: $grantType
        refreshToken: $refreshToken
      ) {
        accessToken
        accessTokenExpiration
        refreshToken
      }
    }
  `,
}