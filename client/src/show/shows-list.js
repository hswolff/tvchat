import React, {
  Component,
} from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import {
  Grid,
  Header,
  Image,
  Segment
} from 'semantic-ui-react'

export default class ShowsList extends Component {
  render() {
    return (
      <Grid>
        {this.props.shows.map(show => (
          <Grid.Column key={show.slug} as={Link} to={`/${show.slug}`} width={4}>
            <Image src={show.images.poster} size="medium" />
            <Segment attached="bottom">
              <Header>{show.title}</Header>
            </Segment>
          </Grid.Column>
        ))}
      </Grid>
    );
  }
}
