import _ from 'lodash';
import fp from 'lodash/fp';

const USERS_UPSERT = 'users/UPSERT';

const initialState = {
  state: null,
  data: {},
  error: null,
};

//
// REDUCER
//

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case USERS_UPSERT: {
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.id]: action.payload,
        },
      };
    }
    default:
      return state;
  }
}

//
// SELECTORS
//

export const getUsers = (state) =>
  _.get(state.users, 'data', {});

export const getUserByProperty = (state, properties) =>
  _.flow(
    getUsers(state),
    fp.find(properties)
  );

export const getUserById = (state, { id }) =>
  _.get(getUsers(state), id, {});

//
// ACTIONS
//

export function upsertUser(payload) {
  return {
    type: USERS_UPSERT,
    payload,
  };
}
