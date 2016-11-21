import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import {
  isLoggedIn,
} from '../data/modules/viewer';

import {
  Container,
} from 'rebass';

import UpdateViewer from './update-viewer';

function AccountPage(props) {
  return (
    <Container>
      <Helmet title="Account" />
      <h1>About</h1>
      {props.isLoggedIn ?
        <UpdateViewer /> :
        <div>Log in!</div>
      }
    </Container>
  );
}

export default connect(
  (state) => ({
    isLoggedIn: isLoggedIn(state),
  })
)(AccountPage);
