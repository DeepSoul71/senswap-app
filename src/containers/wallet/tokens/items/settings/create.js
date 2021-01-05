import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

import { EmojiObjectsRounded } from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import { updateWallet } from 'modules/wallet.reducer';


class CreateTokenAccount extends Component {
  constructor() {
    super();

    this.state = {
      tokenAccount: '',
    }
  }

  onToken = (e) => {
    const tokenAccount = e.target.value || '';
    return this.setState({ tokenAccount });
  }

  newAccount = () => {
    const { wallet: { user, secretKey }, updateWallet } = this.props;
    const { tokenAccount } = this.state;
    if (!tokenAccount) return console.error('Invalid input');

    const payer = sol.fromSecretKey(secretKey);
    const tokenAccountPublicKey = sol.fromAddress(tokenAccount);
    return sol.newSRC20Account(tokenAccountPublicKey, payer).then(tokenAccount => {
      const tokenAccounts = [...user.tokenAccounts];
      tokenAccounts.push(tokenAccount.publicKey.toBase58());
      return updateWallet({ ...user, tokenAccounts });
    }).catch(er => {
      return console.log(er);
    });
  }

  render() {
    const { tokenAccount } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2">Create a new token account</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Token Address"
          variant="outlined"
          color="primary"
          onChange={this.onToken}
          value={tokenAccount}
          InputProps={{
            endAdornment: <IconButton color="primary" onClick={this.newAccount} edge="end" >
              <EmojiObjectsRounded />
            </IconButton>
          }}
          fullWidth
        />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  updateWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(CreateTokenAccount)));