/**
 * Documents
 * @default defaultData
 */

const defaultState = {
  width: 0,
  type: 'xs',
  loading: false,
  error: {
    message: '',
    visible: false,
  },
  success: {
    message: '',
    visible: false,
  },
  leftbar: window.innerWidth >= 600,
  rightbar: false,
}


/**
 * Responsive
 */
export const SET_SCREEN = 'SET_SCREEN';
export const SET_SCREEN_OK = 'SET_SCREEN_OK';
export const SET_SCREEN_FAIL = 'SET_SCREEN_FAIL';

const getCode = (value) => {
  if (value < 600)
    return 'xs';
  if (value < 960)
    return 'sm';
  if (value < 1280)
    return 'md';
  if (value < 1920)
    return 'lg';
  return 'xl';
}

export const setScreen = (width) => {
  return async dispatch => {
    dispatch({ type: SET_SCREEN });

    if (typeof (width) !== 'number' || width < 0) {
      const er = 'Input is null';
      dispatch({ type: SET_SCREEN_FAIL, reason: er });
      throw new Error(er);
    }

    const data = { width, type: getCode(width) };
    dispatch({ type: SET_SCREEN_OK, data });
    return data;
  }
}

/**
 * Scroll
 */
export const SET_SCROLL = 'SET_SCROLL';
export const SET_SCROLL_OK = 'SET_SCROLL_OK';
export const SET_SCROLL_FAIL = 'SET_SCROLL_FAIL';

export const setScroll = (scrollY) => {
  return async (dispatch, getState) => {
    dispatch({ type: SET_SCROLL });

    if (typeof (scrollY) !== 'number' || scrollY < 0) {
      const er = 'Empty input';
      dispatch({ type: SET_SCROLL_FAIL, reason: er });
      throw new Error(er);
    }

    const { ui: { scrollY: prevScrollY } } = getState();
    const data = { scrollY, direction: prevScrollY > scrollY ? 'up' : 'down' };
    dispatch({ type: SET_SCROLL_OK, data });
    return data;
  }
}

/**
 * Notify errors
 */
export const SET_ERROR = 'SET_ERROR';
export const SET_ERROR_OK = 'SET_ERROR_OK';
export const SET_ERROR_FAIL = 'SET_ERROR_FAIL';

export const setError = (msg) => {
  return async (dispatch, getState) => {
    dispatch({ type: SET_ERROR });

    if (!msg) {
      const er = 'Empty input';
      dispatch({ type: SET_ERROR_FAIL, reason: er });
      throw new Error(er);
    }
    const { ui: { error: { visible: prevVisible, message: prevMessage } } } = getState();
    if (prevVisible && msg === prevMessage) {
      const er = 'There exists another error needed to handle first';
      dispatch({ type: SET_ERROR_FAIL, reason: er });
      throw new Error(er);
    }

    const parseError = (er) => {
      if (er instanceof Error) return er.message;
      if (typeof er === 'string') return er;
      if (typeof er === 'object') return JSON.stringify(er);
      return er.toString();
    }

    const data = { error: { message: parseError(msg), visible: true } }
    dispatch({ type: SET_ERROR_OK, data });
    return data;
  }
}

/**
 * Turn off errors
 */
export const UNSET_ERROR = 'UNSET_ERROR';
export const UNSET_ERROR_OK = 'UNSET_ERROR_OK';
export const UNSET_ERROR_FAIL = 'UNSET_ERROR_FAIL';

export const unsetError = () => {
  return async (dispatch, getState) => {
    dispatch({ type: UNSET_ERROR });

    const { ui: { error: { visible: prevVisible } } } = getState();
    if (!prevVisible) {
      const er = 'There is no error';
      dispatch({ type: UNSET_ERROR_FAIL, reason: er });
      throw new Error(er);
    }

    const data = { error: { message: '', visible: false } }
    dispatch({ type: UNSET_ERROR_OK, data });
    return data;
  }
}

/**
 * Notify successs
 */
export const SET_SUCCESS = 'SET_SUCCESS';
export const SET_SUCCESS_OK = 'SET_SUCCESS_OK';
export const SET_SUCCESS_FAIL = 'SET_SUCCESS_FAIL';

export const setSuccess = (msg, link = '#') => {
  return async (dispatch, getState) => {
    dispatch({ type: SET_SUCCESS });

    if (!msg) {
      const er = 'Empty input';
      dispatch({ type: SET_SUCCESS_FAIL, reason: er });
      throw new Error(er);
    }
    const { ui: { success: { visible: prevVisible, message: prevMessage } } } = getState();
    if (prevVisible && msg === prevMessage) {
      const er = 'There exists another success needed to handle first';
      dispatch({ type: SET_SUCCESS_FAIL, reason: er });
      throw new Error(er);
    }

    const data = { success: { message: msg, visible: true, link } }
    dispatch({ type: SET_SUCCESS_OK, data });
    return data;
  }
}

/**
 * Turn off success
 */
export const UNSET_SUCCESS = 'UNSET_SUCCESS';
export const UNSET_SUCCESS_OK = 'UNSET_SUCCESS_OK';
export const UNSET_SUCCESS_FAIL = 'UNSET_SUCCESS_FAIL';

export const unsetSuccess = () => {
  return async (dispatch, getState) => {
    dispatch({ type: UNSET_SUCCESS });

    const { ui: { success: { visible: prevVisible } } } = getState();
    if (!prevVisible) {
      const er = 'There is no success';
      dispatch({ type: UNSET_SUCCESS_FAIL, reason: er });
      throw new Error(er);
    }

    const data = { success: { message: '', visible: false, link: '#' } }
    dispatch({ type: UNSET_SUCCESS_OK, data });
    return data;
  }
}

/**
 * Loading
 */
export const SET_LOADING = 'SET_LOADING';
export const SET_LOADING_OK = 'SET_LOADING_OK';
export const SET_LOADING_FAIL = 'SET_LOADING_FAIL';

export const setLoading = () => {
  return async (dispatch, getState) => {
    dispatch({ type: SET_LOADING });

    const { ui: { loading: prevLoading } } = getState();
    if (prevLoading) {
      const er = 'Already loading';
      dispatch({ type: SET_LOADING_FAIL, reason: er });
      throw new Error(er);
    }

    const data = { loading: true }
    dispatch({ type: SET_LOADING_OK, data });
    return data;
  }
}

/**
 * Unloading
 */
export const UNSET_LOADING = 'UNSET_LOADING';
export const UNSET_LOADING_OK = 'UNSET_LOADING_OK';
export const UNSET_LOADING_FAIL = 'UNSET_LOADING_FAIL';

export const unsetLoading = () => {
  return async (dispatch, getState) => {
    dispatch({ type: UNSET_LOADING });

    const { ui: { loading: prevLoading } } = getState();
    if (!prevLoading) {
      const er = 'Already unloading';
      dispatch({ type: UNSET_LOADING_FAIL, reason: er });
      throw new Error(er);
    }

    const data = { loading: false }
    dispatch({ type: UNSET_LOADING_OK, data });
    return data;
  }
}

/**
 * Toggle leftbar
 */
export const TOGGLE_LEFT_BAR = 'TOOGLE_LEFT_BAR';
export const TOGGLE_LEFT_BAR_OK = 'TOGGLE_LEFT_BAR_OK';
export const TOGGLE_LEFT_BAR_FAIL = 'TOGGLE_LEFT_BAR_FAIL';

export const toggleLeftBar = () => {
  return async (dispatch, getState) => {
    dispatch({ type: TOGGLE_LEFT_BAR });

    const { ui: { leftbar: prevLeftbar } } = getState();

    const data = { leftbar: !prevLeftbar }
    dispatch({ type: TOGGLE_LEFT_BAR_OK, data });
    return data;
  }
}

/**
 * Toggle rightbar
 */
export const TOGGLE_RIGHT_BAR = 'TOOGLE_RIGHT_BAR';
export const TOGGLE_RIGHT_BAR_OK = 'TOGGLE_RIGHT_BAR_OK';
export const TOGGLE_RIGHT_BAR_FAIL = 'TOGGLE_RIGHT_BAR_FAIL';

export const toggleRightBar = () => {
  return async (dispatch, getState) => {
    dispatch({ type: TOGGLE_RIGHT_BAR });

    const { ui: { rightbar: prevRightbar } } = getState();

    const data = { rightbar: !prevRightbar }
    dispatch({ type: TOGGLE_RIGHT_BAR_OK, data });
    return data;
  }
}

/**
 * Reducder
 */
// eslint-disable-next-line
export default (state = defaultState, action) => {
  switch (action.type) {
    case SET_SCREEN_OK:
      return { ...state, ...action.data };
    case SET_SCREEN_FAIL:
      return { ...state, ...action.data };
    case SET_SCROLL_OK:
      return { ...state, ...action.data };
    case SET_SCROLL_FAIL:
      return { ...state, ...action.data };
    case SET_ERROR_OK:
      return { ...state, ...action.data };
    case SET_ERROR_FAIL:
      return { ...state, ...action.data };
    case UNSET_ERROR_OK:
      return { ...state, ...action.data };
    case UNSET_ERROR_FAIL:
      return { ...state, ...action.data };
    case SET_SUCCESS_OK:
      return { ...state, ...action.data };
    case SET_SUCCESS_FAIL:
      return { ...state, ...action.data };
    case UNSET_SUCCESS_OK:
      return { ...state, ...action.data };
    case UNSET_SUCCESS_FAIL:
      return { ...state, ...action.data };
    case SET_LOADING_OK:
      return { ...state, ...action.data };
    case SET_LOADING_FAIL:
      return { ...state, ...action.data };
    case UNSET_LOADING_OK:
      return { ...state, ...action.data };
    case UNSET_LOADING_FAIL:
      return { ...state, ...action.data };
    case TOGGLE_LEFT_BAR_OK:
      return { ...state, ...action.data };
    case TOGGLE_LEFT_BAR_FAIL:
      return { ...state, ...action.data };
    case TOGGLE_RIGHT_BAR_OK:
      return { ...state, ...action.data };
    case TOGGLE_RIGHT_BAR_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}