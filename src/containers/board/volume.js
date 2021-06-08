import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import numeral from 'numeral';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Paper from 'senswap-ui/paper';
import Typography from 'senswap-ui/typography';

import Chart from 'components/chart';
import { setError } from 'modules/ui.reducer';
import { getBoardDaily, getBoardStat } from 'modules/board.reducer';

import styles from './styles';
class Volume extends Component {
  constructor() {
    super();

    this.state = {
      data: [],
      labels: [],
      info: {}
    }
  }

  componentDidMount() {
    this.getDaily();
    this.getStat();
  }

  getDaily = async () => {
    const { getBoardDaily, poolAddress: address } = this.props;
    try {
      const data = await getBoardDaily(address);
      if (data) {
        const values = data.map(e => e.volume)
        const labels = data.map(e => e.time % 100);
        this.setState({ data: values });
        this.setState({ labels: labels });
      }
    } catch (err) {
      return setError(err);
    }
  }

  getStat = async () => {
    const { getBoardStat, poolAddress: address } = this.props;
    try {
      const data = await getBoardStat(address);
      if (data) this.setState({ info: data });
    } catch (err) {
      return setError(err);
    }
  }

  render() {
    const { classes } = this.props;
    const { data, labels, info } = this.state;
    const styles = {
      backgroundColor: 'rgba(115, 136, 169, 0.353283)',
      borderColor: 'rgba(115, 136, 169, 0.353283)',
      borderRadius: 4,
    }

    return <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">Volume</Typography>
          <Typography variant="h5">{info && info.volume24h ? numeral(info.volume24h).format('0.[0]a') : '$0'}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Chart data={data} labels={labels} type="bar" styles={styles} />
        </Grid>
      </Grid>
    </Paper>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  board: state.board,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getBoardDaily, getBoardStat
}, dispatch);

Volume.propTypes = {
  poolAddress: PropTypes.string.isRequired,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Volume)));