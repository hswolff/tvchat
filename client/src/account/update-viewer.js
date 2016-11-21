import React, {
  Component,
} from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

class UpdateViewer extends Component {
  onSubmit = (e) => {
    e.nativeEvent.preventDefault();

    const username = this.refs.username.value;
    const password = this.refs.password.value;
    const email = this.refs.email.value;

    const variables = {
      password,
      username,
      email,
    };

    this.props.updateUser({ variables }).then(res => {
      console.log(res);
      // this.props.viewer.refetch();
    });
  }

  render() {
    return (
      <form onSubmit={this.onSubmit} className="grid -between">
        <input type="text" placeholder="Update Username" ref="username" />
        <input type="text" placeholder="Update Email" ref="email" />
        <input type="password" placeholder="Update Password" ref="password" />
        <button type="submit">Update</button>
      </form>
    );
  }
}

export default graphql(gql`
  mutation updateUser(
    $email: String,
    $username: String,
    $password: String
  ) {
    updateUser(
      email: $email,
      username: $username,
      password: $password
    ) {
      id
      username
      email
      dateCreated
    }
  }
`, { name: 'updateUser' })(UpdateViewer);
