import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Collapse from '@material-ui/core/Collapse';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
  CheckCircleOutlineRounded, HelpOutlineRounded, VerifiedUserRounded,
  PublicRounded, ArrowForwardRounded, OfflineBoltRounded,
  SettingsRounded,
} from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import AccountSelection from 'containers/wallet/components/accountSelection';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet, unlockWallet, syncWallet } from 'modules/wallet.reducer';
import { getAccountData } from 'modules/bucket.reducer';


const EMPTY = {
  txId: '',
  poolAddress: '',
  loading: false,
  amount: 0,
  price: 0,
  anchorEl: null,
}

class NewPool extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      accountData: {},
      advance: false,
    }

    this.swap = window.senwallet.swap;
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  onAdvance = (e) => {
    const advance = e.target.checked || false;
    return this.setState({ advance });
  }

  onClear = () => {
    return this.setState({ ...EMPTY });
  }

  onAddress = (accountAddress) => {
    const { getAccountData, setError } = this.props;
    if (!ssjs.isAddress(accountAddress)) return;
    return getAccountData(accountAddress).then(accountData => {
      return this.setState({ accountData });
    }).catch(er => {
      return setError(er);
    });
  }

  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount });
  }

  onMax = () => {
    const { accountData: { amount: balance, mint } } = this.state;
    const { decimals } = mint || {};
    const amount = ssjs.undecimalize(balance, decimals);
    return this.setState({ amount });
  }

  onPrice = (e) => {
    const price = e.target.value || '';
    return this.setState({ price });
  }

  newPool = () => {
    const { accountData: { address, state, mint }, amount, price } = this.state;
    const {
      wallet: { user, lpts },
      setError,
      updateWallet, unlockWallet, syncWallet
    } = this.props;
    const { address: mintAddress, decimals } = mint || {};
    if (!state) return setError('Please wait for data loaded');
    if (!amount) return setError('Invalid amount');
    if (!price) return setError('Invalid price');

    let poolAddress = '';
    let txId = '';
    let secretKey = null;
    let pool = null;
    let treasury = ssjs.createAccount();
    let lpt = null;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(re => {
        secretKey = re;
        return ssjs.createStrictAccount(this.swap.swapProgramId);
      }).then(re => {
        pool = re;
        poolAddress = pool.publicKey.toBase58();
        return sol.scanLPT(poolAddress, secretKey);
      }).then(({ nextLPT }) => {
        lpt = nextLPT;
        const reserve = ssjs.decimalize(amount, decimals);
        const value = ssjs.decimalize(parseFloat(price) * parseFloat(amount), decimals);
        const payer = ssjs.fromSecretKey(secretKey);
        return this.swap.initializePool(reserve, value, address, mintAddress, pool, treasury, lpt, payer);
      }).then(re => {
        txId = re;
        const lptAddress = lpt.publicKey.toBase58();
        const newPools = [...user.pools];
        if (!newPools.includes(poolAddress)) newPools.push(poolAddress);
        const newLPTs = [...lpts];
        if (!newLPTs.includes(lptAddress)) newLPTs.push(lptAddress);
        return updateWallet({ user: { ...user, pools: newPools }, lpts: newLPTs });
      }).then(re => {
        return syncWallet(secretKey);
      }).then(re => {
        return this.setState({ ...EMPTY, txId, poolAddress });
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
      anchorEl, advance, amount, price,
      loading, txId, poolAddress,
      accountData: { amount: balance, state, mint }
    } = this.state;
    const { decimals, symbol } = mint || {}

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="h6">Your token info</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={this.onOpen}>
              <SettingsRounded color="secondary" fontSize="small" />
            </IconButton>
            <Popover
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.onClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <BaseCard>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2">Interface Settings</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
                      <Grid item>
                        <Typography>Expert mode</Typography>
                      </Grid>
                      <Grid item className={classes.stretch}>
                        <Tooltip title="The LPT account will be selected, or generated automatically by default. By enabling expert mode, you can controll it by hands.">
                          <IconButton size="small">
                            <HelpOutlineRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Switch
                          color="primary"
                          checked={advance}
                          onChange={this.onAdvance}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </BaseCard>
            </Popover>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <AccountSelection onChange={this.onAddress} />
      </Grid>
      <Grid item xs={12}>
        <Collapse in={advance}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography>Network selection</Typography>
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="h6">Pool info</Typography>
          </Grid>
          <Grid item>
            <Tooltip title="You are the first liquidity provider. Once you are happy with the rate click the button to create a new pool.">
              <IconButton size="small">
                <HelpOutlineRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Initial amount"
          variant="outlined"
          value={amount}
          onChange={this.onAmount}
          disabled={!state}
          InputProps={{
            endAdornment: <Tooltip title="Maximum amount">
              <IconButton edge="end" onClick={this.onMax}>
                <OfflineBoltRounded />
              </IconButton>
            </Tooltip>
          }}
          helperText={<span>Available {symbol}: <strong>{utils.prettyNumber(ssjs.undecimalize(balance, decimals))}</strong></span>}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Initial price"
          variant="outlined"
          value={price}
          onChange={this.onPrice}
          disabled={!state}
          fullWidth
        />
      </Grid>
      {txId ? <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2">Done! However, your pool is still unknown by people. You can click the audit button for SenSwap verification that will advertise your pools on SenSwap platform.</Typography>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to={`/audit/submit-pool/${poolAddress}`}
              startIcon={<VerifiedUserRounded />}
              fullWidth
            >
              <Typography>Audit</Typography>
            </Button>
          </Grid>
          <Grid item xs={4}>
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
              <Typography>Skip</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid> : <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={17} /> : <CheckCircleOutlineRounded />}
          onClick={this.newPool}
          disabled={loading || !state}
          fullWidth
        >
          <Typography variant="body2">Create</Typography>
        </Button>
      </Grid>}
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
  updateWallet, unlockWallet, syncWallet,
  getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(NewPool)));