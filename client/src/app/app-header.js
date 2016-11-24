import React from 'react';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import {
  isLoggedIn,
} from '../data/modules/viewer';

import {
  Container,
  Menu,
} from 'semantic-ui-react'

import LogIn from '../account/log-in';

function AppHeader({ isLoggedIn }) {
  return (
    <Container>
      <Menu>
        <Menu.Item as={Link} to="/" activeClassName="active" onlyActiveOnIndex>
          Harry TV
        </Menu.Item>

        <Menu.Menu position="right">
          {isLoggedIn ?
            <Menu.Item as={Link} to="account" activeClassName="active">
              Account
            </Menu.Item> :
            null
          }
          <Menu.Item>
            <LogIn />
          </Menu.Item>
        </Menu.Menu>
      </Menu>
    </Container>
  );
}
export default connect(
  (state) => ({
    isLoggedIn: isLoggedIn(state),
  }),
)(AppHeader);
