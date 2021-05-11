import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Table, { TableBody, TableCell, TableContainer, TableHead, TableRow } from 'senswap-ui/table';
import Favorite from 'senswap-ui/favorite';
import CircularProgress from 'senswap-ui/circularProgress';

import { MintAvatar } from 'containers/wallet';
import Price from './price';
import PriceChange from './priceChange';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class Accounts extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      data: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: prevWallet } = prevProps;
    const { wallet } = this.props;
    if (!isEqual(prevWallet, wallet)) return this.fetchData();
  }

  fetchData = () => {
    const { wallet: { user: { address }, lamports, accounts }, getAccountData } = this.props;

    const solAccount = {
      address,
      amount: global.BigInt(lamports),
      mint: {
        decimals: 9,
        name: 'Solana',
        symbol: 'SOL',
        ticket: 'solana',
        icon: 'https://assets.coingecko.com/coins/images/4128/large/coinmarketcap-solana-200.png'
      }
    }

    if (!accounts || !accounts.length) return this.setState({ data: [solAccount] });
    return this.setState({ loading: true }, () => {
      return accounts.each(accountAddress => {
        return getAccountData(accountAddress);
      }, { skipError: true, skipIndex: true }).then(data => {
        data = data.filter(({ pool }) => {
          const { address: poolAddress } = pool || {};
          return !ssjs.isAddress(poolAddress);
        });
        data.unshift(solAccount);
        return this.setState({ data, loading: false });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  toExplorer = (accountAddress) => {
    return window.open(utils.explorer(accountAddress));
  }

  render() {
    const { classes } = this.props;
    const { loading, data } = this.state;

    return <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>
              <Typography variant="caption" color="textSecondary">ASSET</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="caption" color="textSecondary">SYMBOL</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="caption" color="textSecondary">24H MARKET</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="caption" color="textSecondary">AMOUNT</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="caption" color="textSecondary">TOTAL BALANCE</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!data.length ? <TableRow>
            <TableCell />
            <TableCell >
              {loading ? <CircularProgress size={17} /> : <Typography variant="caption">No token</Typography>}
            </TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell />
          </TableRow> : null}
          {data.map(accountData => {
            const {
              address, amount,
              mint: { address: mintAddress, ticket, icon, name, symbol }
            } = accountData;
            return <TableRow key={address}>
              <TableCell >
                <Favorite />
              </TableCell>
              <TableCell>
                <Grid container className={classes.noWrap} alignItems="center">
                  <Grid item>
                    <MintAvatar title={'View on explorer'} icon={icon} onClick={() => this.toExplorer(address)} />
                  </Grid>
                  <Grid item>
                    <Typography>{name || mintAddress.substring(0, 6) + '...'}</Typography>
                  </Grid>
                </Grid>
              </TableCell>
              <TableCell>
                <Typography>{symbol || 'UNKNOWN'}</Typography>
              </TableCell>
              <TableCell>
                <PriceChange ticket={ticket} />
              </TableCell>
              <TableCell>
                <Typography>{utils.prettyNumber(ssjs.undecimalize(amount, 9))}</Typography>
              </TableCell>
              <TableCell>
                <Price amount={parseFloat(ssjs.undecimalize(amount, 9))} ticket={ticket} />
              </TableCell>
            </TableRow>
          })}
        </TableBody>
      </Table>
    </TableContainer>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bucket: state.bucket,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Accounts)));