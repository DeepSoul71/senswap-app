import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

import { CheckCircleOutlineRounded } from '@material-ui/icons';

import configs from 'configs';
import sol from 'helpers/sol';
import styles from './styles';


class NewPool extends Component {
  constructor() {
    super();

    this.state = {
      amount: 0,
      price: 0,
      value: {},
      pool: '',
      treasury: '',
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: prevWallet } = prevProps;
    const { wallet } = this.props;
    if (!isEqual(wallet, prevWallet)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { token } } = this.props;
    return sol.getTokenAccountData(token).then(value => {
      return this.setState({ value });
    }).catch(er => {
      return console.error(er);
    });
  }

  newPool = () => {
    const { value } = this.state;
    const { wallet: { secretKey } } = this.props;
    if (!value.token || !secretKey) console.error('Invalid input');
    const tokenPublicKey = sol.fromAddress(value.token);
    const payer = sol.fromSecretKey(secretKey);
    return sol.newPoolAndTreasuryAccount(tokenPublicKey, payer).then(({ pool, treasury }) => {
      return this.setState({
        pool: pool.publicKey.toBase58(),
        treasury: treasury.publicKey.toBase58(),
      });
    }).catch(er => {
      return console.error(er);
    });
  }

  renderResult = () => {
    const { pool, treasury } = this.state;
    if (!pool || !treasury) return null;
    return <Grid item xs={12}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">A pool and a treasury account is successfully generated!</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Pool Address"
            variant="outlined"
            value={pool}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Treasury Address"
            variant="outlined"
            value={treasury}
            fullWidth
          />
        </Grid>
      </Grid>
    </Grid>
  }

  render() {
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;
    const { wallet: { token: address } } = this.props;
    const { value, amount, price } = this.state;
    if (!value.token) return null;
    const token = value.token;
    const symbol = value.symbol.join('').replace('-', '');
    const balance = (value.amount / global.BigInt(10 ** value.decimals)).toString();
    const balanceDecimals = (value.amount % global.BigInt(10 ** value.decimals)).toString();

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Typography>You are the first liquidity provider. Once you are happy with the rate click supply to review.</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Swap Factory Address"
          variant="outlined"
          value={swapFactoryAddress}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Token Factory Address"
          variant="outlined"
          value={tokenFactoryAddress}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label={symbol}
          variant="outlined"
          value={address}
          helperText={token}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Initial amount"
          variant="outlined"
          value={amount}
          helperText={Number(balance + '.' + balanceDecimals)}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Initial price"
          variant="outlined"
          value={price}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CheckCircleOutlineRounded />}
          onClick={this.newPool}
          fullWidth
        >
          <Typography variant="body2">Create</Typography>
        </Button>
      </Grid>
      {this.renderResult()}
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(NewPool)));