import React from 'react';
import {
  IndexRoute,
  Route,
} from 'react-router';

// Pages
import App from './app/app';
import HomePage from './home/home-page';
import AboutPage from './about/about-page';
import AccountPage from './account/account-page';
import ShowChatPage from './show/show-chat-page';
import NotFoundPage from './error/error-404';

export default function getRoutes() {
  return (
    <Route path="/" component={App}>
      {/* HomePage (main) route */}
      <IndexRoute name="home" component={HomePage} />

      {/* Routes */}
      <Route name="about" path="about" component={AboutPage} />
      <Route name="account" path="account" component={AccountPage} />
      <Route name="showIndex" path=":showSlug" component={ShowChatPage} />

      {/* Catch all route */}
      <Route path="*" component={NotFoundPage} status={404} />
    </Route>
  );
}
