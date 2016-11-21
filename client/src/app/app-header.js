import React from 'react';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import {
  isLoggedIn,
} from '../data/modules/viewer';

import {
  Container,
  Toolbar,
  NavItem,
  Space,
} from 'rebass';

import LogIn from '../account/log-in';

function AppHeader({ isLoggedIn }) {
  return (
    <Container>
      <Toolbar>
        <NavItem is={Link} to="/">
          Harry TV
        </NavItem>
        <Space
          auto={true}
          x={1}
        />
        {isLoggedIn ?
          <NavItem is={Link} to="account">
            Account
          </NavItem> :
          null
        }
        <NavItem is="div">
          <LogIn />
        </NavItem>
      </Toolbar>
    </Container>
  );
}
export default connect(
  (state) => ({
    isLoggedIn: isLoggedIn(state),
  }),
)(AppHeader);
