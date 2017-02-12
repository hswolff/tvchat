import React, {
  Component,
} from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { graphql, withApollo, compose } from 'react-apollo';
import gql from 'graphql-tag';
import {
  getUsers,
  upsertUser,
} from '../data/modules/users';
import Fragments from '../fragments';

function ChatUserCell({ username }) {
  if (username == null) {
    return null;
  }
  return (
    <div>
      {username}
    </div>
  );
}

class ChatUserList extends Component {
  static defaultProps = {
    users: {},
  };

  state = {
    chatUsers: {},
  };

  componentWillMount() {
    const updatedChatUserId = this.props.client.wsClient.subscribe({
      query: `
        subscription updatedChatUser($showId: String!) {
          updatedChatUser(showId: $showId) {
            added
            chatUser {
              id
              timestamp
              show {
                id
              }
              user {
                ${Fragments.User}
              }
            }
          }
        }
      `,
      variables: { showId: this.props.showId },
    }, (err, result) => {
      if (err != null) {
        console.error(err[0].message);
        return;
      }

      const {
        added,
        chatUser,
      } = result.updatedChatUser;

      if (added) {
        this.setState({
          chatUsers: {
            ...this.state.chatUsers,
            [chatUser.id]: chatUser,
          },
        });
      } else {
        delete this.state.chatUsers[chatUser.id];
        this.setState({ chatUsers: this.state.chatUsers });
      }

      this.props.upsertUser(chatUser.user);
    });

    this.unsubscribe = () => {
      this.props.client.wsClient.unsubscribe(updatedChatUserId);
    };
  }

  componentWillReceiveProps(nextProps) {
    const justLoaded = this.props.chatUsers.loading === true &&
      nextProps.chatUsers.loading === false;
    if (justLoaded) {
      this.setState({ chatUsers: _.keyBy(nextProps.chatUsers.chatUsers, 'id') });

      _.forEach(nextProps.chatUsers.chatUsers, chatUser => {
        this.props.upsertUser(chatUser.user);
      });
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <div>
        {_.map(this.state.chatUsers, chatUser => {
          const user = this.props.users[chatUser.user.id] || chatUser.user;
          return <ChatUserCell key={user.id} {...chatUser} {...user} />;
        })}
      </div>
    );
  }
}

export default compose(
  connect(
    (state) => ({
      users: getUsers(state),
    }),
    {
      upsertUser,
    }
  ),
  graphql(gql`
    query chatUsers($showId: String!) {
      chatUsers(showId: $showId) {
        id
        show {
          id
        }
        user {
          ${Fragments.User}
        }
      }
    }
  `, {
    name: 'chatUsers',
    options: (ownProps) => ({
      forceFetch: true,
      variables: { showId: ownProps.showId },
    }),
  }),
  withApollo
)(ChatUserList);
