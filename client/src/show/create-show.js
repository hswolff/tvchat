import React, {
  Component,
} from 'react';
import _ from 'lodash';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

class CreateShow extends Component {
  onSubmit = (e) => {
    e.nativeEvent.preventDefault();

    const variables = {
      title: this.refs.title.value,
      slug: this.refs.slug.value,
    };

    this.props.createShow(variables);
  }

  render() {
    return (
      <div>
        <h1>Create a Show</h1>
        <form onSubmit={this.onSubmit}>
          <fieldset>
            <input type="text" placeholder="Show Title" ref="title" />
            <input type="text" placeholder="Slug" ref="slug" />
            <input type="text" placeholder="ID" ref="id" />
          </fieldset>
          <button type="submit">Create Show</button>
        </form>
      </div>
    );
  }
}

export default graphql(gql`
  mutation ($title: String!, $slug: String!) {
    createShow(title: $title, slug: $slug) {
      id
      title
      slug
      dateCreated
    }
  }
`, {
  props({ mutate }) {
    return {
      createShow(variables) {
        return mutate({
          variables,
          updateQueries: {
            Shows: (prev, { mutationResult }) => {
              const next = _.clone(prev);
              next.shows.push(mutationResult.data.createShow)
              return next;
            }
          }
        });
      }
    };
  }
})(CreateShow);
