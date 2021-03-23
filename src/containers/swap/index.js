import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Popover from '@material-ui/core/Popover';

import {
  HelpOutlineRounded, PublicRounded, SettingsRounded,
  ArrowForwardRounded, SwapHorizRounded,
} from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import Drain from 'components/drain';
import Bid from './bid';
import Ask from './ask';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import configs from 'configs';
import { setError } from 'modules/ui.reducer';
import { updateWallet, unlockWallet, syncWallet } from 'modules/wallet.reducer';

const EMPTY = {
  loading: false,
  txId: '',
}

class Swap extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,

      srcAddress: '',
      bidAmount: 0,
      bidAddress: '',
      bidData: {},

      dstAddress: '',
      askAmount: 0,
      askAddress: '',
      askData: {},

      fee: global.BigInt(3000000),
      ratio: 0,
    }

    this.swap = window.senwallet.swap;
  }

  onClear = () => {
    return this.setState({ txId: '' });
  }

  estimateAmount = () => {
    const {
      bidAmount,
      bidData: {
        state: bidState,
        reserve: bidReserve,
        lpt: bidLPT,
      },
      askData: {
        state: askState,
        reserve: askReserve,
        lpt: askLPT,
      },
      fee
    } = this.state;
    if (!bidAmount || bidState !== 1 || askState !== 1) return this.setState({ slippage: 0, ratio: 0, askAmount: 0 });
    const newBidReserve = bidReserve + bidAmount;
    const newAskReserve = ssjs.curve(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const slippage = ssjs.slippage(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const ratio = ssjs.ratio(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const paidAmountWithoutFee = askReserve - newAskReserve;
    const askAmount = paidAmountWithoutFee * (global.BigInt(10 ** 9) - fee) / global.BigInt(10 ** 9);
    return this.setState({ slippage, ratio, askAmount });
  }

  estimateInverseAmount = () => {
    const {
      bidData: {
        state: bidState,
        reserve: bidReserve,
        lpt: bidLPT,
      },
      askAmount,
      askData: {
        state: askState,
        reserve: askReserve,
        lpt: askLPT,
      },
      fee
    } = this.state;
    if (!askAmount || bidState !== 1 || askState !== 1) return this.setState({ slippage: 0, ratio: 0, askAmount: 0 });
    const askAmountWithoutFee = askAmount * global.BigInt(10 ** 9) / (global.BigInt(10 ** 9) - fee);
    const newAskReserve = askReserve - askAmountWithoutFee;
    const newBidReserve = ssjs.inverseCurve(newAskReserve, bidReserve, bidLPT, askReserve, askLPT);
    const slippage = ssjs.slippage(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const ratio = ssjs.ratio(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const bidAmount = newBidReserve - bidReserve;
    return this.setState({ slippage, ratio, bidAmount });
  }

  onBid = ({ amount, poolData, accountAddress }) => {
    return this.setState({
      bidAmount: amount,
      bidData: poolData,
      srcAddress: accountAddress,
    }, this.estimateAmount);
  }

  onAsk = ({ amount, poolData, accountAddress }) => {
    const { sol: { senAddress } } = configs;
    const { mint } = poolData;
    const { address: mintAddress } = mint || {}
    let { fee } = this.state;
    if (mintAddress === senAddress) fee = global.BigInt(2500000);
    else fee = global.BigInt(3000000);
    return this.setState({
      askAmount: amount,
      askData: poolData,
      dstAddress: accountAddress,
      fee
    }, this.estimateInverseAmount);
  }

  onAutogenDestinationAddress = (mintAddress, secretKey) => {
    return new Promise((resolve, reject) => {
      const { dstAddress } = this.state;
      const { wallet: { user, accounts }, updateWallet, syncWallet } = this.props;
      if (!ssjs.isAddress(mintAddress) || !secretKey) return reject('Invalid input');
      if (ssjs.isAddress(dstAddress)) return resolve(dstAddress);

      let accountAddress = null;
      return sol.newAccount(mintAddress, secretKey).then(({ address }) => {
        accountAddress = address;
        const newMints = [...user.mints];
        if (!newMints.includes(mintAddress)) newMints.push(mintAddress);
        const newAccounts = [...accounts];
        if (!newAccounts.includes(accountAddress)) newAccounts.push(accountAddress);
        return updateWallet({ user: { ...user, mints: newMints }, accounts: newAccounts });
      }).then(re => {
        return syncWallet(secretKey);
      }).then(re => {
        return resolve(accountAddress);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  onSwap = () => {
    const { setError, unlockWallet } = this.props;
    const {
      bidAmount, srcAddress,
      bidData: {
        state: bidState,
        address: bidAddress,
        treasury: bidTreasury
      },
      askData: {
        state: askState,
        address: askAddress,
        mint: askMint,
        treasury: askTreasury
      }
    } = this.state;

    if (bidState !== 1 || askState !== 1) return setError('Please wait for data loaded');
    if (!bidAmount) return setError('Invalid bid amount');
    if (!ssjs.isAddress(srcAddress)) return setError('Invalid source address');

    let secretKey = null;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(re => {
        secretKey = re;
        return this.onAutogenDestinationAddress(askMint.address, secretKey);
      }).then(dstAddress => {
        const payer = ssjs.fromSecretKey(secretKey);
        return this.swap.swap(
          bidAmount,
          bidAddress,
          bidTreasury.address,
          srcAddress,
          askAddress,
          askTreasury.address,
          dstAddress,
          payer
        );
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
    const {
      bidAmount, bidData: { state: bidState, mint: bidMint },
      askAmount, askData: { state: askState, mint: askMint },
      slippage, ratio, fee, txId, loading
    } = this.state;
    const { decimals: bidDecimals, symbol: bidSymbol } = bidMint || {}
    const { decimals: askDecimals, symbol: askSymbol } = askMint || {}

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} lg={8}>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12} sm={8} md={6}>
            <BaseCard>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h4">Swap</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Drain small />
                </Grid>
                <Grid item xs={12}>
                  <Bid value={ssjs.undecimalize(bidAmount, bidDecimals)} onChange={this.onBid} />
                </Grid>
                <Grid item xs={12}>
                  <Ask value={ssjs.undecimalize(askAmount, askDecimals)} onChange={this.onAsk} />
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2} className={classes.action}>
                    <Grid item xs={12}>
                      <Grid container justify="space-around" spacing={2}>
                        <Grid item>
                          <Typography variant="h4" align="center"><span className={classes.subtitle}>Fee</span> {ssjs.undecimalize(fee, 9) * 100}%</Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="h4" align="center"><span className={classes.subtitle}>{askSymbol}/{bidSymbol}</span> {utils.prettyNumber(ratio)}</Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="h4" align="center"><span className={classes.subtitle}>Slippage</span> {utils.prettyNumber(slippage * 100)}%</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    {txId ? <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={8}>
                          <Button
                            variant="contained"
                            color="secondary"
                            href={utils.explorer(txId)}
                            target="_blank"
                            rel="noopener"
                            startIcon={<PublicRounded />}
                            fullWidth
                          >
                            <Typography>Explore</Typography>
                          </Button>
                        </Grid>
                        <Grid item xs={4}>
                          <Button
                            color="secondary"
                            onClick={this.onClear}
                            endIcon={<ArrowForwardRounded />}
                            fullWidth
                          >
                            <Typography>Done</Typography>
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid> : <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={this.onSwap}
                        startIcon={loading ? <CircularProgress size={17} /> : <SwapHorizRounded />}
                        disabled={loading || bidState !== 1 || askState !== 1}
                        fullWidth
                      >
                        <Typography variant="body2">Swap</Typography>
                      </Button>
                    </Grid>}
                  </Grid>
                </Grid>
              </Grid>
            </BaseCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid >
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  updateWallet, unlockWallet, syncWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Swap)));