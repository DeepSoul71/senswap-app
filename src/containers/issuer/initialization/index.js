import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import Link from 'senswap-ui/link';
import CircularProgress from 'senswap-ui/circularProgress';
import TextField from 'senswap-ui/textField';

import { FlightTakeoffRounded } from 'senswap-ui/icons';

import MintAddress from './address';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet } from 'modules/wallet.reducer';

const EMPTY = {
  loading: false,
  txId: '',
}

class InitializeMint extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      supply: '5000000000',
      decimals: '9',
    }

    this.splt = window.senswap.splt;
  }

  onMint = (secretKey) => {
    const mint = ssjs.fromSecretKey(secretKey);
    return this.setState({ mint });
  }

  onSupply = (e) => {
    const supply = e.target.value || '';
    return this.setState({ supply, ...EMPTY });
  }

  onDecimals = (e) => {
    const decimals = e.target.value || '';
    return this.setState({ decimals, ...EMPTY });
  }

  onCreate = () => {
    const { mint, supply: refSupply, decimals: refDecimals } = this.state;
    const { wallet: { accounts }, setError, updateWallet } = this.props;

    const decimals = parseInt(refDecimals) || 0;
    const supply = parseInt(refSupply) || 0;
    if (!mint) return setError('Waiting for the token address generation');
    if (decimals < 1 || decimals > 9) return setError('Decimals must be an integer that greater than 0, and less then 10');
    if (supply < 1 || supply > 1000000000000) return setError('Total supply must be grearer than0, and less than or equal to 1000000000000');

    const mintAddress = mint.publicKey.toBase58();
    let accountAddress = null;
    const totalSupply = global.BigInt(supply) * global.BigInt(10 ** decimals);
    const wallet = window.senswap.wallet;
    return this.setState({ loading: true }, () => {
      return wallet.getAccount().then(payerAddress => {
        return this.splt.initializeMint(decimals, payerAddress, null, mint, wallet);
      }).then(txId => {
        return sol.newAccount(mintAddress);
      }).then(({ address, txId }) => {
        accountAddress = address;
        return this.splt.mintTo(totalSupply, mintAddress, accountAddress, wallet);
      }).then(txId => {
        const newAccounts = [...accounts];
        if (!newAccounts.includes(accountAddress)) newAccounts.push(accountAddress);
        updateWallet({ accounts: newAccounts });
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
    const { loading, txId, supply, decimals } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Token Info</Typography>
      </Grid>
      <Grid item xs={12}>
        <MintAddress onChange={this.onMint} />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label="Decimals"
          variant="outlined"
          value={decimals}
          onChange={this.onDecimals}
          fullWidth
        />
      </Grid>
      <Grid item xs={8}>
        <TextField
          label="Supply"
          variant="outlined"
          helperText="Do not include decimals."
          value={supply}
          onChange={this.onSupply}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container className={classes.noWrap} spacing={2}>
          <Grid item className={classes.stretch}>
            {txId ? <Typography>Success - <Link href={utils.explorer(txId)} target="_blank" rel="noopener">check it out!</Link></Typography> : null}
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={this.onCreate}
              endIcon={loading ? <CircularProgress size={17} /> : <FlightTakeoffRounded />}
              disabled={loading}
            >
              <Typography>New</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  updateWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(InitializeMint)));