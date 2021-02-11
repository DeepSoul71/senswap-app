import React, { Component, Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';

import { VisibilityRounded, CloseRounded } from '@material-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet } from 'modules/wallet.reducer';
import { getLPTData } from 'modules/bucket.reducer';

function Row(props) {
  const {
    data: {
      address: lptAddress,
      lpt,
      initialized,
      pool: {
        address: poolAddress,
        fee_numerator,
        fee_denominator,
        reserve: poolReserve,
        lpt: poolLPT,
        token,
        treasury
      }
    },
  } = props;
  const [visible, onVisible] = useState(false);
  const classes = makeStyles(styles)();

  if (!initialized) return null;
  const symbol = ssjs.toSymbol(token.symbol);
  const totalSupply = utils.prettyNumber(utils.div(token.total_supply, global.BigInt(10 ** token.decimals)));
  const lptAmount = utils.prettyNumber(utils.div(lpt, global.BigInt(10 ** token.decimals)));
  const price = utils.div(poolLPT, poolReserve);
  const fee = utils.div(fee_numerator, fee_denominator) * 100;
  const reserve = utils.prettyNumber(utils.div(poolReserve, global.BigInt(10 ** token.decimals)));
  const onOpen = () => onVisible(true);
  const onClose = () => onVisible(false);
  return <Fragment>
    <TableRow>
      <TableCell>
        <IconButton size="small" color="secondary" onClick={onOpen}>
          <VisibilityRounded />
        </IconButton>
      </TableCell>
      <TableCell>
        <Typography>{lptAddress}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography>{symbol}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography>{price}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography>{lptAmount}</Typography>
      </TableCell>
    </TableRow>
    <Dialog open={visible} onClose={onClose}>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item className={classes.stretch}>
            <Typography variant="h6">Pool Info</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={onClose} edge="end">
              <CloseRounded />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2">Pool</Typography>
          </Grid>
          <Grid item xs={8}>
            <TextField label="Pool Address" variant="outlined" value={poolAddress} fullWidth />
          </Grid>
          <Grid item xs={4}>
            <TextField label="Fee %" variant="outlined" value={fee} fullWidth />
          </Grid>
          <Grid item xs={8}>
            <TextField label="Treasury Address" variant="outlined" value={treasury.address} fullWidth />
          </Grid>
          <Grid item xs={4}>
            <TextField label="Reserve" variant="outlined" value={reserve} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2">Token</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={symbol}
              variant="outlined"
              value={token.address}
              helperText={`Total supply: ${totalSupply} - Decimals: ${token.decimals}`}
              fullWidth />
          </Grid>
          <Grid item xs={12} /> {/* Safe space */}
        </Grid>
      </DialogContent>
    </Dialog>
  </Fragment>
}

class Info extends Component {
  constructor() {
    super();

    this.state = {
      data: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { lpts: prevLPTs } } = prevProps;
    const { wallet: { lpts } } = this.props;
    if (!isEqual(lpts, prevLPTs)) this.fetchData();
  }

  fetchData = () => {
    const {
      wallet: { lpts },
      setError,
      getLPTData,
    } = this.props;
    if (!lpts.length) return;

    return Promise.all(lpts.map(lptAddress => {
      return getLPTData(lptAddress);
    })).then(data => {
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { data } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TableContainer component={Paper} className={classes.card} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <Typography variant="body2">LPT Account</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">Token</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">Price</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">LPT</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(data => <Row key={data.address} data={data} />)}
            </TableBody>
          </Table>
        </TableContainer>
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
  updateWallet,
  getLPTData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Info)));