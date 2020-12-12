import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

import { CheckCircleRounded, AddCircleRounded, RemoveCircleRounded } from '@material-ui/icons';

import Drain from 'components/drain';
import { BaseCard, NotiCard } from 'components/cards';
import NewPool from './newPool';
import AddLiquidity from './addLiquidity';
import WithdrawLiquidity from './withdrawLiquidity';

import styles from './styles';


class Pool extends Component {

  onRoute = (e, route) => {
    return this.props.history.push(route);
  }

  render() {
    const { classes } = this.props;
    const { location: { pathname } } = this.props;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} md={10}>
        <Grid container justify="center" spacing={2}>
          <Grid item xs={12} md={6}>
            <NotiCard
              title="Liquidity provider incentive"
              description="Liquidity providers earn a 0.3% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity."
              source=""
            />
          </Grid>
          <Grid item xs={12}>
            <Drain small />
          </Grid>
          <Grid item xs={12} md={6}>
            <BaseCard >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <BottomNavigation value={pathname} onChange={this.onRoute} className={classes.navigation} showLabels>
                    <BottomNavigationAction label="New Pool" value="/pool/new-pool" icon={<CheckCircleRounded />} />
                    <BottomNavigationAction label="Add Liquidity" value="/pool/add-liquidity" icon={<AddCircleRounded />} />
                    <BottomNavigationAction label="Withdraw Liquidity" value="/pool/withdraw-liquidity" icon={<RemoveCircleRounded />} />
                  </BottomNavigation>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Switch>
                    <Redirect exact from="/pool" to="/pool/new-pool" />
                    <Route exact path='/pool/new-pool' component={NewPool} />
                    <Route exact path='/pool/add-liquidity' component={AddLiquidity} />
                    <Route exact path='/pool/withdraw-liquidity' component={WithdrawLiquidity} />
                  </Switch>
                </Grid>
              </Grid>
            </BaseCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Pool)));