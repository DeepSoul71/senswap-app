import storage from 'helpers/storage';

/**
 * Documents
 * @default defaultData
 */

// Local storage
const ADDRESS = storage.get('address');
const SECRET_KEY = storage.get('secretKey');
const TOKENS = storage.get('tokens') || [];
const TOKEN = storage.get('token');
const POOLS = storage.get('pools') || [];
const POOL = storage.get('pool');
const defaultState = {
  visible: false,
  address: ADDRESS,
  secretKey: SECRET_KEY,
  tokens: TOKENS,
  token: TOKEN,
  pools: POOLS,
  pool: POOL,
}


/**
 * Open wallet
 */
export const OPEN_WALLET = 'OPEN_WALLET';
export const OPEN_WALLET_OK = 'OPEN_WALLET_OK';
export const OPEN_WALLET_FAIL = 'OPEN_WALLET_FAIL';

export const openWallet = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: OPEN_WALLET });

      const { wallet: { visible } } = getState();
      if (visible) {
        const er = 'Wallet is already opened';
        dispatch({ type: OPEN_WALLET_FAIL, reason: er });
        return reject(er);
      }

      const data = { visible: true };
      dispatch({ type: OPEN_WALLET_OK, data });
      return resolve(data);
    });
  };
};

/**
 * Close wallet
 */
export const CLOSE_WALLET = 'CLOSE_WALLET';
export const CLOSE_WALLET_OK = 'CLOSE_WALLET_OK';
export const CLOSE_WALLET_FAIL = 'CLOSE_WALLET_FAIL';

export const closeWallet = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: CLOSE_WALLET });

      const { wallet: { visible } } = getState();
      if (!visible) {
        const er = 'Wallet is already closed';
        dispatch({ type: CLOSE_WALLET_FAIL, reason: er });
        return reject(er);
      }

      const data = { visible: false };
      dispatch({ type: CLOSE_WALLET_OK, data });
      return resolve(data);
    });
  };
};

/**
 * Set wallet
 */
export const SET_WALLET = 'SET_WALLET';
export const SET_WALLET_OK = 'SET_WALLET_OK';
export const SET_WALLET_FAIL = 'SET_WALLET_FAIL';

export const setWallet = (address, secretKey) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SET_WALLET });

      if (!address || !secretKey) {
        const er = 'Invalid input';
        dispatch({ type: SET_WALLET_FAIL, reason: er });
        return reject(er);
      }

      // Local storage
      storage.set('address', address);
      storage.set('secretKey', secretKey);

      const data = { address, secretKey };
      dispatch({ type: SET_WALLET_OK, data });
      return resolve(data);
    });
  };
};

/**
 * Unset wallet
 */
export const UNSET_WALLET = 'UNSET_WALLET';
export const UNSET_WALLET_OK = 'UNSET_WALLET_OK';
export const UNSET_WALLET_FAIL = 'UNSET_WALLET_FAIL';

export const unsetWallet = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: UNSET_WALLET });

      const { wallet: { address, secretKey } } = getState();
      if (!address || !secretKey) {
        const er = 'Already disconnected';
        dispatch({ type: UNSET_WALLET_FAIL, reason: er });
        return reject(er);
      }

      // Local storage
      storage.clear('address');
      storage.clear('secretKey');

      const data = { address: null, secretKey: null };
      dispatch({ type: UNSET_WALLET_OK, data });
      return resolve(data);
    });
  };
};

/**
 * Update token
 */
export const UPDATE_TOKEN = 'UPDATE_TOKEN';
export const UPDATE_TOKEN_OK = 'UPDATE_TOKEN_OK';
export const UPDATE_TOKEN_FAIL = 'UPDATE_TOKEN_FAIL';

export const updateToken = (tokens, token) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: UPDATE_TOKEN });

      if (!tokens) {
        const er = 'Invalid input';
        dispatch({ type: UPDATE_TOKEN_FAIL, reason: er });
        return reject(er);
      }

      if (!token) {
        const { wallet: { token: _token } } = getState();
        token = _token || tokens[tokens.length - 1];
      }

      // Local storage
      storage.set('tokens', tokens);
      storage.set('token', token);

      const data = { tokens, token };
      dispatch({ type: UPDATE_TOKEN_OK, data });
      return resolve(data);
    });
  };
};

/**
 * Update pool
 */
export const UPDATE_POOL = 'UPDATE_POOL';
export const UPDATE_POOL_OK = 'UPDATE_POOL_OK';
export const UPDATE_POOL_FAIL = 'UPDATE_POOL_FAIL';

export const updatePool = (pools, pool) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: UPDATE_POOL });

      if (!pools) {
        const er = 'Invalid input';
        dispatch({ type: UPDATE_POOL_FAIL, reason: er });
        return reject(er);
      }

      if (!pool) {
        const { wallet: { pool: _pool } } = getState();
        pool = _pool || pools[pools.length - 1];
      }

      // Local storage
      storage.set('pools', pools);
      storage.set('pool', pool);

      const data = { pools, pool };
      dispatch({ type: UPDATE_POOL_OK, data });
      return resolve(data);
    });
  };
};

/**
 * Reducder
 */
export default (state = defaultState, action) => {
  switch (action.type) {
    case OPEN_WALLET_OK:
      return { ...state, ...action.data };
    case OPEN_WALLET_FAIL:
      return { ...state, ...action.data };
    case CLOSE_WALLET_OK:
      return { ...state, ...action.data };
    case CLOSE_WALLET_FAIL:
      return { ...state, ...action.data };
    case SET_WALLET_OK:
      return { ...state, ...action.data };
    case SET_WALLET_FAIL:
      return { ...state, ...action.data };
    case UNSET_WALLET_OK:
      return { ...state, ...action.data };
    case UNSET_WALLET_FAIL:
      return { ...state, ...action.data };
    case UPDATE_TOKEN_OK:
      return { ...state, ...action.data };
    case UPDATE_TOKEN_FAIL:
      return { ...state, ...action.data };
    case UPDATE_POOL_OK:
      return { ...state, ...action.data };
    case UPDATE_POOL_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}