import React, {
  Component,
} from 'react';
import { Link } from 'react-router';
import { graphql } from 'react-apollo';
import _ from 'lodash';
import gql from 'graphql-tag';
import {
  Grid,
} from 'semantic-ui-react'

const ShowRow = (show) => (
  <Grid.Row key={show.slug} as={Link} to={`/${show.slug}`}>
    <Grid.Column width={8}>id: {show.id}</Grid.Column>
    <Grid.Column width={4}>Name: {show.name}</Grid.Column>
    <Grid.Column width={4}>Slug: {show.slug}</Grid.Column>
  </Grid.Row>
);

class ShowsList extends Component {
  render() {
    return (
      <div>
        <h1>Shows</h1>
        <Grid>
          {_.get(this.props, 'data.shows', []).map(ShowRow)}
        </Grid>
      </div>
    );
  }
}

export default graphql(gql`
  query Shows {
    shows {
      id
      name
      slug
      dateCreated
    }
  }
`)(ShowsList);
