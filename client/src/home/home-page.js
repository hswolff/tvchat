import React from 'react';
import _ from 'lodash';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { Divider, Container, Segment, Message, Icon } from 'semantic-ui-react';
import {
  isHomepageInfoDismissed,
  dismissHomepageInfo,
} from '../data/modules/app';
import ShowsList from '../show/shows-list';

const DismissMessage = ({ onClick }) => {
  return <Icon link name="close" onClick={onClick} />;
};
const DismissMessageConnected = connect(null, { onClick: dismissHomepageInfo })(
  DismissMessage,
);

function HomePage(props) {
  const { showMessage } = props;
  return (
    <Container>
      <Helmet title="Harry TV" />
      <Divider hidden />
      <Message info hidden={!showMessage}>
        <DismissMessageConnected />
        <Message.Header>
          Welcome to HarryTV!
        </Message.Header>
        <p>
          The best place to have a real time chat about TV shows that you're watching!
          <br />
          HarryTV connects you with tv fans from around the world from the comfort of your couch.
          <br />
          While you enjoy watching your newest episode chat about it with other fans on HarryTV!
        </p>
      </Message>
      <Segment>
        <ShowsList shows={_.get(props, 'data.homepage', [])} />
      </Segment>
    </Container>
  );
}

const query = gql`
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
`;

export default compose(
  connect(state => ({ showMessage: !isHomepageInfoDismissed(state) })),
  graphql(query),
)(HomePage);
