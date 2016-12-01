import React, {
  Component,
} from 'react';
import { Link } from 'react-router';
import { graphql } from 'react-apollo';
import _ from 'lodash';
import gql from 'graphql-tag';
import {
  Grid,
  Header,
  Image,
} from 'semantic-ui-react'

class ShowsList extends Component {
  render() {
    return (
      <div>
        <h1>Shows</h1>
        <Grid>
          {_.get(this.props, 'data.shows', []).map(show => (
            <Grid.Column key={show.slug} as={Link} to={`/${show.slug}`} width={4}>
              <Image src={show.images.poster} size="medium" />
              <Header attached="bottom">{show.title}</Header>
            </Grid.Column>
          ))}
        </Grid>
      </div>
    );
  }
}

export default graphql(gql`
  query Shows {
    shows {
      id
      title
      slug
      images {
        poster
      }
      dateCreated
    }
  }
`)(ShowsList);
