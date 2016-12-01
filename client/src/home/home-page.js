import React, {
} from 'react';
import _ from 'lodash';
import Helmet from 'react-helmet';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import {
  Divider,
  Container,
  Segment,
} from 'semantic-ui-react';
import ShowsList from '../show/shows-list';

function HomePage(props) {
  return (
    <Container>
      <Helmet title="Harry TV" />
      <Divider hidden />
      <Segment>
        <ShowsList shows={_.get(props, 'data.homepage', [])} />
      </Segment>
    </Container>
  );
}

export default graphql(gql`
  query Homepage {
    homepage {
      id
      title
      slug
      images {
        poster
      }
      dateCreated
    }
  }
`)(HomePage);
