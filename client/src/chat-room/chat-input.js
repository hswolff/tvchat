import React, {
  Component,
  PropTypes,
} from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

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
      <form onSubmit={this.onSubmit} className="clearfix mt1">
        <input
          type="text"
          placeholder="Your Message"
          value={this.state.value}
          onChange={e => this.setState({ value: e.target.value })}
          className="form-control col col-9"
        />
        <div className="pl2 col col-3 center">
          <button
            type="submit"
            className=""
            style={{ width: '100%' }}
            disabled={this.state.value === ''}
          >
            Send
          </button>
        </div>
      </form>
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
      userId
      showId
      message
      timestamp
    }
  }
`, { name: 'createChatMessage' })(ChatInput);
