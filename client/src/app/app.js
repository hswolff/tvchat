import React, {
  PropTypes,
} from 'react';

import AppSideEffects from './app-side-effects';
import AppHeader from './app-header';
import './app.css';

export default function App(props) {
  const {
    children,
  } = props;

  return (
    <div>
      <AppSideEffects />
      <AppHeader />
      {children}
    </div>
  );
}

App.propTypes = {
  children: PropTypes.node,
};
