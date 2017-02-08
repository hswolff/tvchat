import { combineReducers } from 'redux';

import app from './app';
import users from './users';
import viewer from './viewer';

export default function createRootRecuer(additionalReducers = {}) {
  return combineReducers({
    app,
    users,
    viewer,
    ...additionalReducers,
  });
}
