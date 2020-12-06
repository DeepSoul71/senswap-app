import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import { SaveAltRounded } from '@material-ui/icons';

import styles from './styles';
import { setWallet } from 'modules/wallet.reducer';


class KeyStore extends Component {

  onSave = () => {
    const { setWallet } = this.props;
    return setWallet();
  }

  render() {
    const { classes } = this.props;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography>Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
          <Grid item>
            <Button startIcon={<SaveAltRounded />}>
              <Typography>Upload keystore</Typography>
            </Button>
          </Grid>
          <Grid item className={classes.stretch}>
            <TextField
              label="Password (optional)"
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={this.onSave}
              fullWidth
            >
              <Typography>OK</Typography>
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
  setWallet
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(KeyStore)));