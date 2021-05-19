import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import fileDownload from 'js-file-download';
import ssjs, { KeystoreWallet } from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import TextField from 'senswap-ui/textField';
import Button, { IconButton } from 'senswap-ui/button';
import Link from 'senswap-ui/link';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import CircularProgress from 'senswap-ui/circularProgress';

import {
  PublishRounded, DescriptionRounded, PowerRounded,
  CloseRounded, GetAppRounded, VisibilityRounded,
  VisibilityOffRounded,
} from 'senswap-ui/icons';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { setWallet } from 'modules/wallet.reducer';


class KeyStore extends Component {
  constructor() {
    super();

    this.state = {
      password: '',
      newPassword: '',
      filename: '',
      keystore: {},
      newKeystore: {},
      loading: false,
      visible: false,
      visiblePassword: false,
    }
  }

  onUpload = () => {
    return document.getElementById('keystore-file').click();
  }

  onKeystore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = () => {
      return this.setState({
        filename: file.name,
        keystore: JSON.parse(reader.result)
      });
    }
  }

  onPassword = (e) => {
    const password = e.target.value || '';
    return this.setState({ password });
  }

  onNewPassword = (e) => {
    const newPassword = e.target.value || '';
    const newKeystore = ssjs.gen(newPassword);
    return this.setState({ newPassword, newKeystore });
  }

  onVisiblePassword = () => {
    const { visiblePassword } = this.state;
    return this.setState({ visiblePassword: !visiblePassword });
  }

  connect = async () => {
    const { password, keystore } = this.state;
    const { setError, setWallet } = this.props;
    if (!keystore) return setError('Please upload your keystore');
    if (!password) return setError('Please enter your password to unlock your wallet');
    const wallet = new KeystoreWallet(keystore, password);
    this.setState({ loading: true });
    try {
      await setWallet(wallet);
    } catch (er) {
      setError(er);
    }
    return this.setState({ loading: false });
  }

  onDownload = () => {
    const { newKeystore } = this.state;
    if (!newKeystore.publicKey) return setError('Cannot download now');
    return fileDownload(JSON.stringify(newKeystore), `senwallet-keystore-${newKeystore.publicKey}.json`);
  }

  onOpen = () => this.setState({ visible: true });
  onClose = () => this.setState({ visible: false });

  render() {
    const { classes } = this.props;
    const {
      loading, visible, visiblePassword,
      password, newPassword, newKeystore, filename
    } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item>
            <IconButton size="small">
              <DescriptionRounded />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h6">Keystore</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography>This keystore format is compatible with <Link href="https://solflare.com" target="_blank" rel="noopener">SolFlare</Link> keystore.</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          placeholder="Filename"
          variant="contained"
          value={filename}
          InputProps={{
            endAdornment: <Grid item>
              <Button onClick={this.onUpload} startIcon={<PublishRounded />} >
                <Typography>Upload</Typography>
              </Button>
            </Grid>,
            readOnly: true
          }}
          fullWidth
        />
        <input
          id="keystore-file"
          type="file"
          accept="application/json"
          onChange={this.onKeystore}
          style={{ "display": "none" }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          placeholder="Password"
          type="password"
          variant="contained"
          value={password}
          onChange={this.onPassword}
          InputProps={{
            endAdornment: <Grid item>
              <Button
                color="primary"
                onClick={this.connect}
                startIcon={loading ? <CircularProgress size={17} /> : <PowerRounded />}
                disabled={loading}
              >
                <Typography>Connect</Typography>
              </Button>
            </Grid>
          }}
          fullWidth
        />
      </Grid>
      <Grid item className={classes.help}>
        <Button color="primary" onClick={this.onOpen} fullWidth >
          <Typography>Not have keystore yet?</Typography>
        </Button>
      </Grid>
      <Dialog open={visible} onClose={this.onClose}>
        <DialogTitle>
          <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
            <Grid item className={classes.stretch}>
              <Typography variant="h6">Password</Typography>
            </Grid>
            <Grid item>
              <IconButton onClick={this.onClose} edge="end">
                <CloseRounded />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography>The password is used to encrypt your keystore. You will need this password to unlock your keystore later.</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                type={visiblePassword ? 'text' : 'password'}
                variant="outlined"
                value={newPassword}
                onChange={this.onNewPassword}
                InputProps={{
                  endAdornment: <IconButton onClick={this.onVisiblePassword} edge="end">
                    {visiblePassword ? <VisibilityRounded /> : <VisibilityOffRounded />}
                  </IconButton>
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container justify="flex-end">
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<GetAppRounded />}
                    onClick={this.onDownload}
                    disabled={!newKeystore || !newKeystore.publicKey}
                  >
                    <Typography>Download</Typography>
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} /> {/* Safe space */}
          </Grid>
        </DialogContent>
      </Dialog>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  setWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(KeyStore)));