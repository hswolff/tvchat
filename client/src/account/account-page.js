import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import {
  Divider,
  Container,
  Segment,
} from 'semantic-ui-react';
import {
  isLoggedIn,
} from '../data/modules/viewer';
import UpdateViewer from './update-viewer';

function AccountPage(props) {
  return (
    <Container>
      <Helmet title="Account" />
      <Divider hidden />
      <Segment>
        <h1>About</h1>
        {props.isLoggedIn ?
          <UpdateViewer /> :
          <div>Log in!</div>
        }
      </Segment>
    </Container>
  );
}

export default connect(
  (state) => ({
    isLoggedIn: isLoggedIn(state),
  })
)(AccountPage);
