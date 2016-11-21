import { combineReducers } from 'redux';

import users from './users';
import viewer from './viewer';

export default function createRootRecuer(additionalReducers = {}) {
  return combineReducers({
    users,
    viewer,
    ...additionalReducers,
  });
}
