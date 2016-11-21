import {
  Component,
} from 'react';
import _ from 'lodash';
import { graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import {
  isLoggedIn,
  isAccessTokenExpired as isAccessTokenExpiredSelector,
  getAccessToken,
  getRefreshToken,
  getSafeAccessTokenExpiration,
  persistViewer,
  logOut,
} from '../data/modules/viewer';

class AppSideEffects extends Component {
  timeoutId = null;

  componentWillMount() {
    if (!this.props.isLoggedIn) {
      return;
    }

    if (this.props.isAccessTokenExpired) {
      this.refreshToken();
    }

    this.createRefreshTimeout();
  }

  componentWillReceiveProps(nextProps) {
    const accessTokenChanged = this.props.accessToken !== nextProps.accessToken;
    if (accessTokenChanged && nextProps.accessToken != null) {
      this.createRefreshTimeout(nextProps);
    } else if (nextProps.accessToken == null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  createRefreshTimeout(props = this.props) {
    if (!props.isLoggedIn) {
      return;
    }

    clearTimeout(this.timeoutId);
    this.timeoutId = null;
    const timeout = props.accessTokenExpiration - Date.now();

    this.timeoutId = setTimeout(() => {
      this.refreshToken();
    }, timeout);
  }

  async refreshToken() {
    const res = await this.props.refreshToken();
    this.props.persistViewer(res.data.createToken);
  }

  render() {
    return null;
  }
}

export default [
  graphql(gql`
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
  `, {
    props: ({ ownProps, mutate }) => ({
      refreshToken(props = {}) {
        return mutate({
          variables: {
            grantType: 'refreshToken',
            refreshToken: ownProps.refreshToken,
            ...props,
          },
        });
      },
    }),
  }),
  connect(
    (state) => ({
      isLoggedIn: isLoggedIn(state),
      isAccessTokenExpired: isAccessTokenExpiredSelector(state),
      accessTokenExpiration: getSafeAccessTokenExpiration(state),
      accessToken: getAccessToken(state),
      refreshToken: getRefreshToken(state),
    }),
    {
      persistViewer,
      logOut,
    },
  ),
].reduce((ExportComponent, hoc) => hoc(ExportComponent), AppSideEffects);
