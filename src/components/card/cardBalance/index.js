import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Paper from 'senswap-ui/paper';
import Typography from 'senswap-ui/typography';
import { IconButton } from 'senswap-ui/button';
import Chip from 'senswap-ui/chip';
import Tooltip from 'senswap-ui/tooltip';
import CircularProgress from 'senswap-ui/circularProgress';

import {
  WarningRounded,
  VisibilityRounded, VisibilityOffRounded, CallMadeRounded
} from 'senswap-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';


class CardBalance extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      censored: false,
      usd: 0,
      btc: 0,
      error: '',
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { accountData: prevAccountData } = prevProps
    const { accountData } = this.props;
    if (!isEqual(prevAccountData, accountData)) this.fetchData();
  }

  onCensored = () => {
    const { censored } = this.state;
    return this.setState({ censored: !censored });
  }

  fetchData = () => {
    const { accountData } = this.props;
    return this.setState({ loading: true }, () => {
      return accountData.filter(({ mint: { ticket } }) => ticket).each(({ amount, mint: { decimals, ticket } }) => {
        const balance = ssjs.undecimalize(amount, decimals);
        return utils.fetchValue(balance, ticket);
      }).then(data => {
        const usd = data.map(({ usd }) => usd).reduce((a, b) => a + b, 0);
        const btc = data.map(({ btc }) => btc).reduce((a, b) => a + b, 0);
        return this.setState({ usd, btc, error: '', loading: false });
      }).catch(er => {
        return this.setState({ error: er.toString(), usd: 0, btc: 0, loading: false });
      });
    });
  }

  render() {
    const { classes, address } = this.props;
    const { censored, error, usd, btc, loading } = this.state;

    return <Paper className={classes.paper}>
      <Grid item container>
        <Grid item xs={12}>
          <Grid container className={classes.noWrap} alignItems="center">
            <Grid item className={classes.stretch}>
              {error ? <Tooltip title={error}>
                <IconButton size="small" color="primary">
                  <WarningRounded />
                </IconButton>
              </Tooltip> : null}
            </Grid>
            <Grid item>
              <IconButton
                size="small"
                className={classes.iconButton}
                onClick={this.onCensored}
              >
                {censored ? <VisibilityOffRounded /> : <VisibilityRounded />}
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton
                size="small"
                className={classes.iconButton}
                href={utils.explorer(address)}
                target="_blank"
                rel="noopener"
              >
                <CallMadeRounded />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} />
        <Grid item xs={12}>
          <Typography varinat="h6" align="center">Total Balance</Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={1}>
            <Grid item>
              <Chip
                avatar={loading ? <CircularProgress size={15} /> : null}
                label={<Typography variant="subtitle1">BTC</Typography>}
                color="#FF9F38"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" align="center">{censored ? "*****" : utils.prettyNumber(btc)}</Typography>
              <Typography color="textSecondary" align="center">{censored ? '*****' : '$' + utils.prettyNumber(usd)}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} />
      </Grid>
    </Paper>
  }
}

CardBalance.defaultProps = {
  address: '',
  accountData: []
}

CardBalance.propsType = {
  address: PropTypes.string,
  accountData: PropTypes.array
}

export default withStyles(styles)(CardBalance);