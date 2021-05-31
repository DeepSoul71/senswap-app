import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import List from 'senswap-ui/list';
import CircularProgress from 'senswap-ui/circularProgress';
import Button from 'senswap-ui/button';
import Typography from 'senswap-ui/typography';

import EventItem from './eventItem';

import styles from './styles';
import utils from 'helpers/utils';
import { findAllTransactionByTime } from 'helpers/report';
import { setError } from 'modules/ui.reducer';
import { getMintData } from 'modules/bucket.reducer';


const ONE_HOUR = 3600;

class LatestActivity extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      timeTo: Math.ceil(Number(new Date()) / 1000),
      timeFrom: Math.ceil(Number(new Date()) / 1000) - ONE_HOUR,
      data: []
    }
  }

  componentDidMount() {
    const { ui: { rightbar } } = this.props;
    if (rightbar) this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { accounts: prevAccounts }, ui: { rightbar: prevRightbar } } = prevProps;
    const { wallet: { accounts }, ui: { rightbar } } = this.props;
    if (!isEqual(prevAccounts, accounts) && rightbar) return this.fetchData();
    if (!isEqual(prevRightbar, rightbar) && rightbar) return this.fetchData();
  }

  fetchMint = async (txData) => {
    const { getMintData } = this.props;
    const { data, ...others } = txData;
    const mintData = await Promise.all(data.map(({ mint }) => getMintData(mint)));
    const re = data.map((each, index) => {
      const { mint, ...someothers } = each;
      return { mint: mintData[index], ...someothers }
    });
    return { data: re, ...others }
  }

  fetchData = async () => {
    const { wallet: { user: { address } }, setError } = this.props;
    const { timeTo, timeFrom } = this.state;
    this.setState({ loading: true });
    try {
      const txs = await findAllTransactionByTime(address, timeFrom, timeTo);
      let expandedData = [];
      for (let txData of txs) {
        if (txData.type === 'transfer') {
          if (txData.data[0].owner === address) txData.type = 'send';
          else txData.type = 'receive';
        }
        try {
          const re = await this.fetchMint(txData);
          expandedData.push(re);
        } catch (er) { /* Nothing */ }
      }
      const { data } = this.state;
      expandedData = data.concat(expandedData);
      return this.setState({ data: expandedData, loading: false });
    } catch (er) {
      await setError(er);
      return this.setState({ loading: false });
    }
  }

  onMore = () => {
    let { timeFrom, timeTo } = this.state;
    timeTo = timeFrom;
    timeFrom = timeTo - ONE_HOUR;
    return this.setState({ timeFrom, timeTo }, () => {
      return this.fetchData();
    });
  }

  renderItem = (txData) => {
    const type = txData.type;
    const time = new Date(txData.blockTime * 1000);
    const txId = txData.signature;
    if (!txData.data || !txData.data.length) return null;

    if (type === 'swap') {
      const [srcData, dstData] = txData.data;
      const { amount: srcAmount, mint: { decimals: srcDecimals, symbol: srcSymbol } } = srcData;
      const { amount: dstAmount, mint: { decimals: dstDecimals, symbol: dstSymbol } } = dstData;
      const srcDescription = `${utils.prettyNumber(ssjs.undecimalize(srcAmount, srcDecimals)) || 0} ${srcSymbol || 'Unknown'}`;
      const dstDescription = `${utils.prettyNumber(ssjs.undecimalize(dstAmount, dstDecimals)) || 0} ${dstSymbol || 'Unknown'}`;
      return <EventItem
        key={Math.random()}
        variant={type}
        time={time}
        description={`${srcDescription} → ${dstDescription}`}
        link={utils.explorer(txId)}
      />
    }

    const [srcData] = txData.data;
    const { amount, mint: { decimals, symbol } } = srcData;
    const description = `${utils.prettyNumber(ssjs.undecimalize(amount, decimals)) || 0} ${symbol || 'Unknown'}`;
    return <EventItem
      key={Math.random()}
      variant={type}
      time={time}
      description={`${description}`}
      link={utils.explorer(txId)}
    />
  }

  render() {
    const { data, loading, timeFrom } = this.state;
    const hours = Math.round((Math.ceil(Number(new Date()) / 1000) - timeFrom) / ONE_HOUR);

    return <Grid container>
      <Grid item xs={12} >
        <List>
          {data.map(txData => this.renderItem(txData))}
        </List>
      </Grid>
      <Grid item xs={12}>
        <Button onClick={this.onMore} startIcon={loading ? <CircularProgress size={17} /> : null} fullWidth>
          <Typography>See more</Typography>
        </Button>
      </Grid>
      <Grid item xs={12} style={{ marginTop: -20 }}>
        <Grid container justify="center">
          <Grid item>
            <Typography variant="caption" color="textSecondary">{`(${hours} hour${hours === 1 ? '' : 's'} ago)`}</Typography>
          </Grid>
        </Grid>
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
  getMintData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LatestActivity)));