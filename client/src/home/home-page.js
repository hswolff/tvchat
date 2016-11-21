import React, {
} from 'react';
import Helmet from 'react-helmet';

import {
  Container,
} from 'rebass';

import CreateShow from '../show/create-show';
import ShowsList from '../show/shows-list';

export default function HomePage() {
  return (
    <Container>
      <Helmet title="Harry TV" />
      <ShowsList />
      <CreateShow />
    </Container>
  );
}
