import React, {
  Component,
  PropTypes,
} from 'react';
import _ from 'lodash';
import { StyleSheet, css } from 'aphrodite';
import { connect } from 'react-redux';
import { graphql, withApollo, compose } from 'react-apollo';
import gql from 'graphql-tag';
import {
  Container,
  Dimmer,
  Grid,
  Loader,
  Segment,
} from 'semantic-ui-react';
import {
  getUsers,
  upsertUser,
} from '../data/modules/users';
import {
  isLoggedIn as isLoggedInSelector,
  getAccessToken,
} from '../data/modules/viewer';
import Fragments from '../fragments';
import ChatMessage from './chat-message';
import ChatInput from './chat-input';
import ChatUserList from './chat-user-list';

const styles = StyleSheet.create({
  overflow: {
    height: '70vh',
    overflowX: 'hidden',
    overflowU: 'scroll',
    paddingBottom: '20px',
  },
});

class ChatRoom extends Component {
  static propTypes = {
    accessToken: PropTypes.string,
    isLoggedIn: PropTypes.bool.isRequired,
    showId: PropTypes.string.isRequired,
    users: PropTypes.object.isRequired,
    upsertUser: PropTypes.func.isRequired,
  };

  state = {
    messages: [],
    chatUsers: {},
  };

  componentWillMount() {
    const subscribeId = this.props.client.wsClient.subscribe({
      query: `
        subscription newChatMessage($showId: String!) {
          newChatMessage(showId: $showId) {
            id
            userId
            showId
            message
            timestamp
            user {
              ${Fragments.User}
            }
          }
        }
      `,
      variables: { showId: this.props.showId },
    }, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      if (result.newChatMessage.user) {
        this.props.upsertUser(result.newChatMessage.user);
      }

      this.setState({
        messages: this.state.messages.concat(result.newChatMessage),
      }, this.scrollToBottom);
    });

    const updatedUserId = this.props.client.wsClient.subscribe({
      query: `
        subscription updatedUser {
          updatedUser {
            ${Fragments.User}
          }
        }
      `,
    }, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      if (result.updatedUser) {
        this.props.upsertUser(result.updatedUser);
      }
    });


    this.unsubscribe = () => {
      this.props.client.wsClient.unsubscribe(subscribeId);
      this.props.client.wsClient.unsubscribe(updatedUserId);
    }

    if (this.props.isLoggedIn) {
      this.registerActiveUser(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    const loginStateChanged = this.props.isLoggedIn !== nextProps.isLoggedIn;
    if (loginStateChanged) {
      if (nextProps.isLoggedIn) {
        this.registerActiveUser(nextProps);
      } else {
        this.unregisterActiveUser();
      }
    }

    const chatMessagesLoaded = this.props.chatMessages.loading === true &&
      nextProps.chatMessages.loading === false;
    if (chatMessagesLoaded) {
      const users = _.uniqBy(_.get(nextProps.chatMessages, 'chatMessages', []), 'user.id');
      users.forEach(data => {
        this.props.upsertUser(data.user);
      });

      requestAnimationFrame(this.scrollToBottom)
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.unregisterActiveUser();
  }

  onUpdate = (data) => {
    if (data.message) {
      this.setState({
        messages: Array.isArray(data.message) ?
          data.message :
          this.state.messages.concat(data.message),
      });
    }
    if (data.user) {
      this.props.upsertUser(data.user);
    }

    this.scrollToBottom();
  };

  registerActiveUser({ showId, accessToken}) {
    this.newChatUserId = this.props.client.wsClient.subscribe({
      query: `
        subscription newChatUser($showId: String!, $accessToken: String!) {
          newChatUser(showId: $showId, accessToken: $accessToken)
        }
      `,
      variables: {
        accessToken: accessToken,
        showId: showId,
      },
      operationName: 'newChatUser',
    }, (err, result) => {
      if (err) {
        console.error(err);
      }
    });
  }

  unregisterActiveUser() {
    if (this.newChatUserId) {
      this.props.client.wsClient.unsubscribe(this.newChatUserId)
      this.newChatUserId = null;
    }
  }

  scrollToBottom = _.debounce(() => {
    if (this && this.refs.messages) {
      this.refs.messages.scrollTop = this.refs.messages.scrollHeight;
    }
  }, 50);

  render() {
    const chatMessages = _.get(this.props.chatMessages, 'chatMessages', [])
      .concat(this.state.messages);

    return (
      <Container>
        <Grid>
          <Grid.Column width={13}>
            <Dimmer.Dimmable as={Segment} blurring dimmed={this.props.chatMessages.loading}>
              <Dimmer active={this.props.chatMessages.loading} inverted />
              <Loader size="large" active={this.props.chatMessages.loading}>Loading</Loader>

              <div className={css(styles.overflow)} ref="messages">
                {chatMessages.map(chatMessage =>
                  <ChatMessage key={chatMessage.id} {...chatMessage} />
                )}
              </div>

              {this.props.isLoggedIn ?
                <ChatInput showId={this.props.showId} /> :
                <div>Log In!</div>
              }
            </Dimmer.Dimmable>
          </Grid.Column>
          <Grid.Column width={3}>
            <Segment>
              <ChatUserList showId={this.props.showId} />
            </Segment>
          </Grid.Column>
        </Grid>
      </Container>
    );
  }
}

export default compose(
  connect(
    (state) => ({
      isLoggedIn: isLoggedInSelector(state),
      accessToken: getAccessToken(state),
      users: getUsers(state),
    }),
    {
      upsertUser,
    }
  ),
  graphql(gql`
    query chatMessages($showId: String!) {
      chatMessages(showId: $showId) {
        id
        userId
        showId
        message
        timestamp
        user {
          ${Fragments.User}
        }
      }
    }
  `, {
    name: 'chatMessages',
    options: (ownProps) => ({
      forceFetch: true,
      variables: { showId: ownProps.showId },
    }),
  }),
  withApollo,
)(ChatRoom);
