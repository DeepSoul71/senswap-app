import bs58 from 'bs58';
import ssjs from 'senswapjs';

import storage from 'helpers/storage';
import WalletInterface from '../walletInterface';

class Coin98Wallet extends WalletInterface {
  constructor() {
    super();

    this._setWallet();
  }

  _setWallet = () => {
    storage.set('WalletType', 'Coin98');
  }

  _getNode = () => {
    const { coin98 } = window;
    const { sol } = coin98 || {};
    if (!sol) throw new Error('Wallet is not connected');
    return sol;
  }

  _getAccount = () => {
    return new Promise((resolve, reject) => {
      const node = this._getNode();
      return node.request({ method: 'sol_accounts' }).then(([account]) => {
        if (!account) return reject('There is no Solana account');
        return resolve(account);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  _sign = (transaction) => {
    return new Promise((resolve, reject) => {
      const node = this._getNode();
      return this.getAccount().then(account => {
        transaction.feePayer = ssjs.fromAddress(account);
        return node.request({ method: 'sol_sign', params: [transaction] })
      }).then(({ publicKey, signature }) => {
        publicKey = ssjs.fromAddress(publicKey);
        signature = bs58.decode(signature);
        return resolve({ publicKey, signature });
      }).catch(er => {
        return reject(er.message);
      });
    });
  }
}

export default Coin98Wallet;