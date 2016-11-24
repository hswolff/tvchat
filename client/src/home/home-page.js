import React, {
} from 'react';
import Helmet from 'react-helmet';
import {
  Divider,
  Container,
  Segment,
} from 'semantic-ui-react';
import CreateShow from '../show/create-show';
import ShowsList from '../show/shows-list';

export default function HomePage() {
  return (
    <Container>
      <Helmet title="Harry TV" />
      <Divider hidden />
      <Segment>
        <ShowsList />
      </Segment>
      <Segment>
        <CreateShow />
      </Segment>
    </Container>
  );
}
