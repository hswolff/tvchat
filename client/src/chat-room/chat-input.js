import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import {
  Form,
} from 'semantic-ui-react';

class ChatInput extends Component {
  static propTypes = {
    showId: PropTypes.string.isRequired,
  };

  state = {
    value: '',
  };

  onSubmit = (e) => {
    e.nativeEvent.preventDefault();

    const variables = {
      showId: this.props.showId,
      message: this.state.value,
    };

    this.props.createChatMessage({ variables }).then(res => {
      this.setState({ value: '' });
    });
  }

  render() {
    return (
      <Form onSubmit={this.onSubmit}>
        <Form.Group width={16}>
          <Form.Input
            width={16}
            name="inputText"
            type="text"
            placeholder="Your Message"
            value={this.state.value}
            onChange={e => this.setState({ value: e.target.value })}
            autoComplete="off"
          />
          <Form.Button
            floated="right"
            type="submit"
            disabled={this.state.value === ''}
          >
            Send
          </Form.Button>
        </Form.Group>
      </Form>
    );
  }
}

export default graphql(gql`
  mutation (
    $showId: String!,
    $message: String!
  ) {
    createChatMessage(
      showId: $showId,
      message: $message
    ) {
      id
      message
      timestamp
    }
  }
`, { name: 'createChatMessage' })(ChatInput);
