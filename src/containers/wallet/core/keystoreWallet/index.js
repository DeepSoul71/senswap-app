import ssjs from 'senswapjs';

import storage from 'helpers/storage';
import WalletInterface from '../walletInterface';

class KeystoreWallet extends WalletInterface {
  constructor(keystore, password) {
    super();

    this._setWallet(keystore, password);
  }

  _setWallet = (keystore, password) => {
    const account = ssjs.fromKeystore(keystore, password);
    const secretKey = Buffer.from(account.secretKey).toString('hex');
    return storage.set('SecretKey', secretKey);
  }

  _getWallet = () => {
    const secretKey = storage.get('SecretKey');
    const account = ssjs.fromSecretKey(secretKey);
    return account;
  }

  _getAccount = () => {
    return new Promise((resolve, reject) => {
      const account = this._getWallet();
      if (!account || !account.publicKey) return reject('No account');
      const address = account.publicKey.toBase58();
      return resolve(address);
    });
  }

  _sign = (transaction) => {
    return new Promise((resolve, reject) => {
      const account = this._getWallet();
      try {
        const confirmed = window.confirm('Please confirm to sign the traction!');
        if (!confirmed) return reject('User rejects to sign the transaction');
        const address = account.publicKey.toBase58();
        transaction.sign(account);
        return resolve({ address, transaction });
      } catch (er) {
        return reject(er);
      }
    });
  }
}

export default KeystoreWallet;