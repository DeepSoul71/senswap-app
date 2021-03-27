import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { FlightTakeoffRounded, DeleteForeverRounded } from '@material-ui/icons';

import Ban from 'components/ban';
import MintAvatar from 'containers/wallet/components/mintAvatar';
import MintSelection from 'containers/wallet/components/mintSelection';

import styles from './styles';
import configs from 'configs';
import { setError } from 'modules/ui.reducer';
import { unlockWallet } from 'modules/wallet.reducer';
import { updateMint, deleteMint } from 'modules/mint.reducer';

const EMPTY = {
  loading: false,
  ok: false,
}

class UpdateMint extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      data: {},
    }
  }

  onUpdate = () => {
    const { updateMint, unlockWallet, setError } = this.props;
    const { data } = this.state;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(secretKey => {
        return updateMint(data, secretKey);
      }).then(re => {
        return this.setState({ ...EMPTY, ok: true });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  onDelete = () => {
    const { deleteMint, unlockWallet, setError } = this.props;
    const { data } = this.state;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(secretKey => {
        return deleteMint(data, secretKey);
      }).then(re => {
        return this.setState({ ...EMPTY, ok: true });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  onAddress = (e) => {
    const address = e.target.value || '';
    const { data } = this.state;
    const newData = { ...data, address }
    return this.setState({ data: newData });
  }

  onName = (e) => {
    const name = e.target.value || '';
    const { data } = this.state;
    const newData = { ...data, name }
    return this.setState({ data: newData });
  }

  onSymbol = (e) => {
    const symbol = e.target.value || '';
    const { data } = this.state;
    const newData = { ...data, symbol }
    return this.setState({ data: newData });
  }

  onIcon = (e) => {
    const icon = e.target.value || '';
    const { data } = this.state;
    const newData = { ...data, icon }
    return this.setState({ data: newData });
  }

  onMint = (data) => {
    return this.setState({ data });
  }

  render() {
    const { classes } = this.props;
    const { basics: { permission } } = configs;
    const { wallet: { user: { role } } } = this.props;
    const { loading, data, ok } = this.state;

    if (!permission.includes(role)) return <Ban />
    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Old info</Typography>
      </Grid>
      <Grid item xs={12}>
        <MintSelection onChange={this.onMint} />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">New info</Typography>
      </Grid>
      <Grid item xs={6}>
        <TextField
          variant="outlined"
          label="Name"
          value={data.name || ''}
          onChange={this.onName}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          variant="outlined"
          label="Symbol"
          value={data.symbol || ''}
          onChange={this.onSymbol}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          label="Icon"
          value={data.icon || ''}
          onChange={this.onIcon}
          InputProps={{
            startAdornment: <MintAvatar icon={data.icon} marginRight />
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          label="Address"
          value={data.address || ''}
          onChange={this.onAddress}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} className={classes.noWrap} alignItems="flex-end">
          <Grid item className={classes.stretch}>
            <Typography variant="body2">{ok ? 'Done!' : ''}</Typography>
          </Grid>
          <Grid item>
            <Button
              onClick={this.onDelete}
              endIcon={<DeleteForeverRounded />}
              disabled={loading}
            >
              <Typography>Delete</Typography>
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={this.onUpdate}
              endIcon={<FlightTakeoffRounded />}
              disabled={loading}
            >
              <Typography>Update</Typography>
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
  mint: state.mint,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  unlockWallet,
  updateMint, deleteMint,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(UpdateMint)));