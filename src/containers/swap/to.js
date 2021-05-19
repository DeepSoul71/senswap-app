import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import TextField from 'senswap-ui/textField';
import Divider from 'senswap-ui/divider';
import CircularProgress from 'senswap-ui/circularProgress';

import { ArrowDropDownRounded } from 'senswap-ui/icons';

import { MintAvatar, MintSelection } from 'containers/wallet';

import styles from './styles';
import sol from 'helpers/sol';
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class To extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      visible: false,
      accountData: {},
      value: '',
    }
  }

  componentDidMount = () => {
    const { value } = this.props;
    this.setState({ value });
  }

  componentDidUpdate = (prevProps) => {
    const { value: prevValue } = prevProps;
    const { value } = this.props;
    if (!isEqual(prevValue, value)) this.setState({ value });
  }

  onOpen = () => this.setState({ visible: true });
  onClose = () => this.setState({ visible: false });

  onMintData = async (mintData) => {
    const { address: mintAddress } = mintData;
    const { setError, getAccountData, wallet: { user: { address: walletAddress } } } = this.props;
    try {
      this.setState({ loading: true }, this.onClose);
      let accountData = await sol.scanAccount(mintAddress, walletAddress);
      const { state, address: accountAddress } = accountData || {}
      if (!state) accountData = { address: '', amount: 0n, mint: mintData };
      else accountData = await getAccountData(accountAddress);
      return this.setState({ loading: false, accountData, value: '' }, this.returnData);
    } catch (er) {
      return setError(er);
    }
  }

  onValue = (e) => {
    const value = e.target.value || '';
    return this.setState({ value }, this.returnData);
  }

  onMax = () => {
    const { accountData: { amount, mint } } = this.state;
    const { decimals } = mint || {}
    const value = ssjs.undecimalize(amount, decimals);
    const pseudoEvent = { target: { value } }
    return this.onValue(pseudoEvent);
  }

  returnData = () => {
    const { onChange } = this.props;
    const { accountData, value } = this.state;
    return onChange({ accountData, value });
  }

  render() {
    const { classes } = this.props;
    const { loading, visible, accountData, value } = this.state;
    const { mint } = accountData || {}
    const { icon, symbol } = mint || {}

    return <Grid container>
      <Grid item xs={12}>
        <TextField
          variant="contained"
          label="To"
          placeholder="0"
          value={value}
          onChange={this.onValue}
          InputProps={{
            startAdornment: <Grid container className={classes.noWrap}>
              <Grid item>
                <Button
                  size="small"
                  startIcon={loading ? <CircularProgress size={17} /> : <MintAvatar icon={icon} />}
                  endIcon={<ArrowDropDownRounded />}
                  onClick={this.onOpen}
                >
                  <Typography>{symbol || 'Select'} </Typography>
                </Button>
              </Grid>
              <Grid item style={{ paddingLeft: 0 }}>
                <Divider orientation="vertical" />
              </Grid>
            </Grid>
          }}
        />
        <MintSelection
          visible={visible}
          onChange={this.onMintData}
          onClose={this.onClose}
        />
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
  getAccountData
}, dispatch);

To.defaultProps = {
  value: '',
  onChange: () => { },
}

To.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(To)));