import React, {
  Component,
} from 'react';
import _ from 'lodash';
import { graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import {
  Form,
  Button,
} from 'semantic-ui-react';
import {
  isLoggedIn,
  persistViewer,
  logOut,
} from '../data/modules/viewer';

// Source: http://emailregex.com/
// eslint-disable-next-line max-len, no-useless-escape
const EMAIL_REGEX = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

class LogIn extends Component {
  onSubmit = async (e, serializedForm) => {
    e.nativeEvent.preventDefault();

    const {
      username,
      password,
    } = serializedForm.formData;
    if (!username || !password) {
      return;
    }

    const values = {
      password,
      username: null,
      email: null,
    };

    if (EMAIL_REGEX.test(username)) {
      values.email = username;
    } else {
      values.username = username;
    }

    try {
      const res = await this.props.logIn(values);
      this.props.persistViewer(res.data.createToken);
      this.props.viewer.refetch();
    } catch (e) {
      if (e.message.match(/User does not exist/)) {
        return this.createUser(values);
      }
    }
  }

  createUser = (values) => {
    this.props.createUser({ variables: values }).then(res => {
      this.props.persistViewer(res.data.createUser);
      this.props.viewer.refetch();
    });
  }

  render() {
    if (this.props.isLoggedIn) {
      return (
        <div>
          {_.get(this.props, 'viewer.viewer.username')}
          &nbsp;&nbsp;&nbsp;
          <Button onClick={this.props.logOut} icon="sign out" />
        </div>
      );
    }

    return (
      <Form onSubmit={this.onSubmit} size="small">
        <Form.Group inline>
          <Form.Input type="text" name="username" placeholder="username" />
          <Form.Input type="password" name="password" placeholder="password" />
          <Form.Button type="submit" size="small" icon="sign in"></Form.Button>
        </Form.Group>
      </Form>
    );
  }
}

const LogInConnected = connect(
  (state) => ({
    isLoggedIn: isLoggedIn(state),
  }),
  {
    persistViewer,
    logOut,
  },
)(LogIn);

const Query = graphql(gql`
  query viewer {
    viewer {
      id
      email
      username
      dateCreated
    }
  }
`, { name: 'viewer' });

const LogInMutation = graphql(gql`
  mutation (
    $grantType: GrantType!,
    $username: String,
    $email: String,
    $password: String,
  ) {
    createToken(
      grantType: $grantType
      username: $username
      email: $email
      password: $password
    ) {
      accessToken
      accessTokenExpiration
      refreshToken
    }
  }
`, {
  props: ({ mutate }) => ({
    logIn(props) {
      return mutate({
        variables: {
          grantType: 'password',
          ...props,
        },
      });
    },
  }),
});

const CreateUser = graphql(gql`
  mutation (
    $username: String!,
    $email: String,
    $password: String,
  ) {
    createUser(
      username: $username
      email: $email
      password: $password
    ) {
      accessToken
      accessTokenExpiration
      refreshToken
    }
  }
`, { name: 'createUser' });

export default [
  Query,
  LogInMutation,
  CreateUser,
].reduce((Comp, apollo) => apollo(Comp), LogInConnected);
