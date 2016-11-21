import _ from 'lodash';

const VIEWER_LOG_OUT = 'viewer/LOG_OUT';

const VIEWER_PERSIST = 'viewer/PERSIST';
const VIEWER_HYDRATE = 'viewer/HYDRATE';

const VIEWER_LOCALSTORAGE_KEY = 'viewer';

const MinutesInMs = 1000 * 60;
const FiveMinutesInMs = MinutesInMs * 5;

const initialState = {
  state: null,
  data: null,
  error: null,
};

//
// REDUCER
//

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case VIEWER_LOG_OUT: {
      return { ...initialState };
    }
    case VIEWER_HYDRATE:
    case VIEWER_PERSIST: {
      return {
        ...state,
        data: action.payload,
      };
    }
    default:
      return state;
  }
}

//
// SELECTORS
//

export const isLoggedIn = (state) => state.viewer.data != null;

export const getAccessToken = (state) =>
  _.get(state.viewer, 'data.accessToken', null);

export const getRefreshToken = (state) =>
  _.get(state.viewer, 'data.refreshToken', null);

export const isAccessTokenExpired = (state) =>
   _.get(state.viewer, 'data.accessTokenExpiration', 0) * 1000 < Date.now();

export const getSafeAccessTokenExpiration = (state) => {
  const exp = _.get(state.viewer, 'data.accessTokenExpiration', null);
  if (exp == null) {
    return null;
  }

  return (exp * 1000) - FiveMinutesInMs;
};

//
// ACTIONS
//

export function persistViewer(data) {
  return (dispatch) => {
    localStorage.setItem(VIEWER_LOCALSTORAGE_KEY, JSON.stringify(data));

    dispatch({ type: VIEWER_PERSIST, payload: data });
  };
}

export function logOut() {
  localStorage.removeItem(VIEWER_LOCALSTORAGE_KEY);
  return {
    type: VIEWER_LOG_OUT,
  };
}

export function hydrateViewer() {
  return (dispatch) => {
    const raw = localStorage.getItem(VIEWER_LOCALSTORAGE_KEY);
    try {
      const data = JSON.parse(raw);

      dispatch({ type: VIEWER_HYDRATE, payload: data });
    } catch (e) {
      dispatch(logOut());
    }
  };
}
