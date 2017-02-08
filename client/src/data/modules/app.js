import _ from 'lodash';

const DISMISS_HOMEPAGE_INFO = 'app/DISMISS_HOMEPAGE_INFO';
const SHOW_HOMEPAGE_INFO = 'app/SHOW_HOMEPAGE_INFO';

const initialState = {
  homepageInfoDismissed: false,
};

//
// REDUCER
//
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case DISMISS_HOMEPAGE_INFO: {
      return { ...state, homepageInfoDismissed: true };
    }
    case SHOW_HOMEPAGE_INFO: {
      return { ...state, homepageInfoDismissed: false };
    }
    default:
      return state;
  }
}

//
// SELECTORS
//
export const isHomepageInfoDismissed = state => state.app.homepageInfoDismissed;

//
// ACTIONS
//
export function dismissHomepageInfo() {
  return { type: DISMISS_HOMEPAGE_INFO };
}

export function showHomepageInfo() {
  return { type: SHOW_HOMEPAGE_INFO };
}
