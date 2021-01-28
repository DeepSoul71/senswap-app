import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import ListSubheader from '@material-ui/core/ListSubheader';
import MenuItem from '@material-ui/core/MenuItem';

import { UnfoldMoreRounded, EmojiObjectsRounded } from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { openWallet } from 'modules/wallet.reducer';


class AccountSelection extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
      address: '',
      symbol: 'Address',
      data: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { user: prevUser } } = prevProps;
    const { wallet: { user } } = this.props;
    if (!isEqual(user, prevUser)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { user: { tokenAccounts } } } = this.props;
    return Promise.all(tokenAccounts.map(tokenAccount => {
      return sol.getTokenData(tokenAccount);
    })).then(data => {
      return this.setState({ data }, () => {
        if (!data.length) return this.onAddress({ target: { value: null } });
        const { address } = data[0];
        return this.onAddress({ target: { value: address } });
      });
    }).catch(er => {
      return console.error(er);
    });
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  onAddress = (e) => {
    const address = e.target.value || '';
    const { data } = this.state;
    let symbol = 'Address';
    let balance = '0';
    for (let account of data) {
      const {
        address: refAddress,
        amount: refAmount,
        token: { symbol: refSymbol, decimals }
      } = account;
      if (address === refAddress) {
        symbol = sol.toSymbol(refSymbol);
        balance = utils.prettyNumber(utils.div(refAmount, global.BigInt(10 ** decimals)));
      }
    }
    return this.setState({ address, symbol, balance }, () => {
      this.onClose();
      return this.props.onChange(address);
    });
  }

  onSelect = (address) => {
    const pseudoEvent = { target: { value: address } }
    return this.onAddress(pseudoEvent);
  }

  renderGroupedTokensData = () => {
    const { data } = this.state;
    let groupedTokensData = {};
    data.forEach(({ address, token }) => {
      const symbol = sol.toSymbol(token.symbol);
      if (!groupedTokensData[symbol]) groupedTokensData[symbol] = [];
      groupedTokensData[symbol].push(address);
    });

    let render = [];
    for (let symbol in groupedTokensData) {
      render.push(<ListSubheader key={symbol}>{symbol}</ListSubheader>)
      groupedTokensData[symbol].forEach(address => {
        render.push(<MenuItem key={address} onClick={() => this.onSelect(address)}>
          <Typography noWrap>{address}</Typography>
        </MenuItem>)
      });
    }

    return render;
  }

  render() {
    const { openWallet } = this.props;
    const { anchorEl, address, symbol, balance } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label={symbol}
          variant="outlined"
          value={address}
          onChange={this.onAddress}
          InputProps={{
            endAdornment: <IconButton onClick={this.onOpen} edge="end">
              <UnfoldMoreRounded />
            </IconButton>
          }}
          helperText={`Balance: ${balance}`}
          fullWidth
        />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.onClose}
        >
          {this.renderGroupedTokensData()}
          <ListSubheader>If you cannot find your accounts</ListSubheader>
          <MenuItem>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EmojiObjectsRounded />}
              onClick={openWallet}
              fullWidth
            >
              <Typography>Add an existing account</Typography>
            </Button>
          </MenuItem>
        </Menu>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  openWallet,
}, dispatch);

AccountSelection.defaultProps = {
  onChange: () => { },
}

AccountSelection.propTypes = {
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AccountSelection)));