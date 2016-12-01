import React, {
  Component,
} from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import _ from 'lodash';
import Helmet from 'react-helmet';
import {
  Divider,
  Container,
  Segment,
} from 'semantic-ui-react';
import ShowsList from './shows-list';

class ShowsListPage extends Component {
  render() {
    return (
      <Container>
        <Helmet title="Shows" />
        <Divider hidden />
        <Segment>
          <ShowsList shows={_.get(this.props, 'data.shows', [])} />
        </Segment>
      </Container>
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
`)(ShowsListPage);
