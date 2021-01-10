import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import ListSubheader from '@material-ui/core/ListSubheader';
import MenuItem from '@material-ui/core/MenuItem';

import { EmojiObjectsRounded, UnfoldMoreRounded } from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import { openWallet } from 'modules/wallet.reducer';


class Address extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
      lptAccount: '',
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
    const { wallet: { user: { lptAccounts } } } = this.props;
    return Promise.all(lptAccounts.map(lptAccount => {
      return sol.getPoolData(lptAccount);
    })).then(re => {
      return this.setState({ data: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  onAddress = (lptAccount) => {
    return this.setState({ lptAccount }, () => {
      this.props.onChange(lptAccount);
      return this.onClose();
    });
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  onAdd = () => {
    const { openWallet } = this.props;
    return openWallet();
  }

  renderGroupedLPTsData = () => {
    const { data } = this.state;
    const groupedLPTsData = {};
    data.forEach(({ address, pool: { token } }) => {
      const symbol = sol.toSymbol(token.symbol);
      if (!groupedLPTsData[symbol]) groupedLPTsData[symbol] = [];
      return groupedLPTsData[symbol].push(address);
    });

    const render = [];
    for (let symbol in groupedLPTsData) {
      render.push(<ListSubheader key={symbol}>{symbol}</ListSubheader>)
      groupedLPTsData[symbol].forEach(address => {
        return render.push(<MenuItem key={address} onClick={() => this.onAddress(address)}>
          <Typography noWrap>{address}</Typography>
        </MenuItem>)
      });
    }
    render.push(<ListSubheader key="info">Create a new LPT address</ListSubheader>)
    render.push(<MenuItem key="button">
      <Button
        variant="contained"
        color="primary"
        startIcon={<EmojiObjectsRounded />}
        onClick={this.onAdd}
        fullWidth
      >
        <Typography>Create</Typography>
      </Button>
    </MenuItem>)

    return render;
  }

  render() {
    const { anchorEl, lptAccount } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="LPT account"
          variant="outlined"
          value={lptAccount}
          onChange={(e) => this.onAddress(e.target.value || '')}
          InputProps={{
            endAdornment: <IconButton color="primary" onClick={this.onOpen} edge="end" >
              <UnfoldMoreRounded />
            </IconButton>
          }}
          fullWidth
        />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.onClose}
        >
          {this.renderGroupedLPTsData()}
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

Address.defaultProps = {
  onChange: () => { },
}

Address.propTypes = {
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Address)));