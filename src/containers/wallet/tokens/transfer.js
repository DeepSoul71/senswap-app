import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';
import Link from '@material-ui/core/Link';
import Collapse from '@material-ui/core/Collapse';
import Tooltip from '@material-ui/core/Tooltip';

import { SendRounded, CloseRounded, EcoRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { unlockWallet } from 'modules/wallet.reducer';
import { getAccountData } from 'modules/bucket.reducer';


const EMPTY = {
  loading: false,
  txId: '',
}

class TokenTransfer extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      address: '',
      amount: '',
    }

    this.splt = window.senwallet.splt;
  }

  onAddress = (e) => {
    const address = e.target.value || '';
    return this.setState({ address });
  }

  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount });
  }

  onMax = () => {
    const { wallet: { mainAccount }, getAccountData, setError } = this.props;
    return getAccountData(mainAccount).then(data => {
      const { amount, mint } = data;
      return this.setState({ amount: utils.div(amount, global.BigInt(10 ** mint.decimals)).toString() });
    }).catch(er => {
      return setError(er);
    });
  }

  onClear = () => {
    return this.setState({ ...EMPTY, address: '', amount: '' });
  }

  safelyParseAmount = (decimals) => {
    const { amount: strAmount } = this.state;
    const isFloat = strAmount.indexOf('.') !== -1;

    if (!isFloat) {
      let amount = parseInt(strAmount);
      if (!amount) return 0n;
      return global.BigInt(amount) * global.BigInt(10 ** decimals);
    }
    else {
      let [strIntegers, strFloats] = strAmount.split('.');
      if (!parseInt(strIntegers) || !parseInt(strFloats)) return 0n;
      let bigIntIntegers = global.BigInt(strIntegers) * global.BigInt(10 ** decimals);
      while (strFloats.length < decimals) strFloats = strFloats + '0';
      let bigIntFloats = global.BigInt(strFloats.substring(0, decimals));
      return bigIntIntegers + bigIntFloats;
    }
  }

  onTransfer = () => {
    const {
      wallet: { mainAccount },
      setError,
      unlockWallet,
      getAccountData
    } = this.props;
    const { address } = this.state;
    if (!ssjs.isAddress(mainAccount)) return setError('Invalid sender address');
    if (!ssjs.isAddress(address)) return setError('Invalid receiver address');

    let decimals = null;
    return this.setState({ loading: true }, () => {
      return getAccountData(mainAccount).then(re => {
        const { mint: { decimals: _decimals } } = re;
        decimals = _decimals;
        return unlockWallet();
      }).then(secretKey => {
        const amount = this.safelyParseAmount(decimals);
        if (!amount) throw new Error('Invalid amount');
        const payer = ssjs.fromSecretKey(secretKey);
        return this.splt.transfer(amount, mainAccount, address, payer);
      }).then(txId => {
        return this.setState({ ...EMPTY, txId });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { address, amount, loading, txId } = this.state;

    return <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="body2">Send token</Typography>
      </Grid>
      <Grid item xs={4}>
        <BaseCard variant="fluent" className={classes.paper}>
          <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
            <Grid item className={classes.stretch}>
              <InputBase
                placeholder='Amount'
                onChange={this.onAmount}
                value={amount}
              />
            </Grid>
            <Grid item>
              <Tooltip title="Maximum amount">
                <IconButton
                  color="secondary"
                  size="small"
                  onClick={this.onMax}>
                  <EcoRounded />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </BaseCard>
      </Grid>
      <Grid item xs={8}>
        <BaseCard variant="fluent" className={classes.paper}>
          <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
            <Grid item className={classes.stretch}>
              <InputBase
                placeholder='Receiver'
                onChange={this.onAddress}
                value={address}
                fullWidth
              />
            </Grid>
            <Grid item>
              <IconButton
                color="secondary"
                size="small"
                onClick={this.onTransfer}>
                {loading ? <CircularProgress size={17} /> : <SendRounded />}
              </IconButton>
            </Grid>
          </Grid>
        </BaseCard>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={Boolean(txId)}>
          <Alert
            severity="success"
            action={<IconButton onClick={this.onClear} size="small"><CloseRounded /></IconButton>}
          >
            <Typography>Success - <Link color="inherit" href={utils.explorer(txId)} target="_blank" rel="noopener">check it out!</Link></Typography>
          </Alert>
        </Collapse>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  unlockWallet,
  getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TokenTransfer)));