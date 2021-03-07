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
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import ListSubheader from '@material-ui/core/ListSubheader';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';
import Chip from '@material-ui/core/Chip';

import {
  CheckCircleOutlineRounded, ExpandMoreRounded,
  HelpOutlineRounded, SearchRounded, SentimentVeryDissatisfiedRounded
} from '@material-ui/icons';

import PoolPrice from './poolPrice';
import MintAvatar from 'containers/wallet/components/mintAvatar';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getPools, getPool } from 'modules/pool.reducer';
import { getMints, getMint } from 'modules/mint.reducer';
import { getPoolData } from 'modules/bucket.reducer';


class MintSelection extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
      type: 'recommended',
      index: 0,
      recommended: {
        pools: [],
        limit: 5,
        page: -1
      },
      new: {
        pools: [],
        limit: 5,
        page: -1
      },
      search: '',
      searched: {
        pools: [],
      },
    }
  }

  componentDidMount() {
    this.fetchRecommendedPools();
    this.fetchNewPools();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { user: { mints: prevMints } } } = prevProps;
    const { wallet: { user: { mints } } } = this.props;
    if (!isEqual(mints, prevMints)) {
      this.fetchRecommendedPools();
      this.fetchNewPools();
    }
  }

  fetchPools = (typeOrCondition, limit, page) => {
    return new Promise((resolve, reject) => {
      const { wallet: { user: { mints } } } = this.props;
      const { getPools, getPool, getMints, getMint } = this.props;
      let pools = [];

      const recommendedCondition = { '$or': mints.map(mintAddress => ({ mint: mintAddress, verified: true })) }
      const newCondition = { '$and': mints.map(mintAddress => ({ '$or': [{ mint: { '$ne': mintAddress } }, { verified: false }] })) }
      let condition = typeOrCondition;
      if (typeOrCondition === 'recommended') {
        if (!mints.length) return resolve(pools);
        condition = recommendedCondition;
      }
      if (typeOrCondition === 'new') {
        if (!mints.length) condition = {}
        else condition = newCondition;
      }

      return getPools(condition, limit, page).then(poolIds => {
        return Promise.all(poolIds.map(({ _id }) => {
          return getPool(_id);
        }));
      }).then(data => {
        pools = data;
        return Promise.all(pools.map(({ mint }) => {
          return getMints({ address: mint });
        }));
      }).then(data => {
        const mintIds = data.map(([mintId]) => mintId || { _id: null });
        return Promise.all(mintIds.map(({ _id }) => {
          return getMint(_id).then(data => {
            return Promise.resolve(data);
          }).catch(er => {
            return Promise.resolve({});
          });
        }));
      }).then(data => {
        pools = pools.map((pool, i) => {
          const newPool = { ...pool }
          newPool.mint = { address: pool.mint, ...data[i] }
          return newPool;
        });
        return resolve(pools);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  fetchRecommendedPools = () => {
    const { setError } = this.props;
    const { recommended: { limit, page } } = this.state;
    return this.fetchPools('recommended', limit, page + 1).then(pools => {
      if (!pools.length) return;
      return this.setState({ recommended: { pools, limit, page: page + 1 } }, () => {
        return this.onSelect('recommended', 0);
      });
    }).catch(er => {
      return setError(er);
    });
  }

  fetchNewPools = () => {
    const { setError } = this.props;
    const { new: { limit, page } } = this.state;
    return this.fetchPools('new', limit, page + 1).then(pools => {
      if (!pools.length) return;
      return this.setState({ new: { pools, limit, page: page + 1 } }, () => {
        return this.onSelect('new', 0);
      });
    }).catch(er => {
      return setError(er);
    });
  }

  onSelect = (type, index) => {
    const { onChange } = this.props;
    const { [type]: { pools } } = this.state;
    return this.setState({ type, index }, () => {
      const { address } = pools[index];
      onChange(address);
      return this.onClose();
    });
  }

  onSearch = (e) => {
    const search = e.target.value || '';
    if (search.length > 4) return;
    return this.setState({ search }, () => {
      const { search: value } = this.state;
      if (value.length < 2) return this.setState({ searched: { pools: [] } });
      const condition = { symbol: { '$regex': value, '$options': 'gi' } }
      return this.fetchPools(condition, 1000, 0).then(pools => {
        return this.setState({ searched: { pools } });
      }).catch(er => {
        return this.setState({ searched: { pools: [] } });
      });
    });
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  renderMint = (name, icon, author, verified) => {
    const { classes } = this.props;
    return <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
      <Grid item>
        <Badge
          badgeContent={
            verified ? <Tooltip title="This pool is verified by SenSwap">
              <CheckCircleOutlineRounded className={classes.badgeIcon} />
            </Tooltip> : <Tooltip title="This pool is NOT verified by SenSwap">
                <HelpOutlineRounded className={classes.badgeIcon} />
              </Tooltip>
          }
          overlap="circle"
          color={verified ? 'primary' : 'secondary'}
          classes={{
            badge: classes.badge,
            colorPrimary: classes.verified,
            colorSecondary: classes.unverified,
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
        >
          <MintAvatar icon={icon} />
        </Badge>
      </Grid>
      <Grid item className={classes.stretch}>
        <Typography>{name}</Typography>
        <Typography className={classes.subtitle}>Created by {author || 'Unknown'}</Typography>
      </Grid>
    </Grid>
  }

  renderRecommendedPools = () => {
    const { recommended: { pools }, search } = this.state;
    if (!pools.length || search) return null;
    return <MenuList>
      <ListSubheader disableSticky>Recommended pools</ListSubheader>
      {pools.map((pool, index) => {
        const { address, author, verified, mint: { name, icon } } = pool;
        return <MenuItem key={address} onClick={() => this.onSelect('recommended', index)}>
          {this.renderMint(name || address, icon, author, verified)}
        </MenuItem>
      })}
    </MenuList>
  }

  renderNewPools = () => {
    const { new: { pools }, search } = this.state;
    if (!pools.length || search) return null;
    return <MenuList>
      <ListSubheader disableSticky>New pools</ListSubheader>
      {pools.map((pool, index) => {
        const { address, author, verified, mint: { name, icon } } = pool;
        return <MenuItem key={address} onClick={() => this.onSelect('new', index)}>
          {this.renderMint(name || address, icon, author, verified)}
        </MenuItem>
      })}
    </MenuList>
  }

  renderSearchedPools = () => {
    const { search, searched: { pools } } = this.state;
    if (!search) return null;
    if (!pools.length) return <ListSubheader disableSticky>No result</ListSubheader>
    return <MenuList>
      <ListSubheader disableSticky>Search</ListSubheader>
      {pools.map((pool, index) => {
        const { address, author, verified, mint: { name, icon } } = pool;
        return <MenuItem key={address} onClick={() => this.onSelect('searched', index)}>
          {this.renderMint(name || address, icon, author, verified)}
        </MenuItem>
      })}
    </MenuList>
  }

  render() {
    const { classes } = this.props;
    const { anchorEl, index, type, search } = this.state;
    const { [type]: { pools } } = this.state;

    const pool = pools[index] || {
      verified: false,
      address: '',
      mint: {
        symbol: 'Unknown',
        icon: '',
      }
    }
    const { verified, address, mint: { symbol, icon } } = pool;

    return <Grid container spacing={2} alignItems="flex-end" className={classes.noWrap}>
      <Grid item className={classes.stretch}>
        <Chip
          avatar={<Avatar src={icon} className={classes.icon}>
            <SentimentVeryDissatisfiedRounded />
          </Avatar>}
          label={symbol || address.substring(0, 4) + '...' + address.substring(address.length - 4, address.lentgh)}
          onClick={this.onOpen}
          deleteIcon={<ExpandMoreRounded />}
          onDelete={this.onOpen}
          color={verified ? 'primary' : 'secondary'}
          classes={{
            root: classes.chip,
            colorPrimary: classes.verified,
            colorSecondary: classes.unverified,
          }}
        />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.onClose}
        >
          <Grid container spacing={2} className={classes.tools}>
            <Grid item xs={12}>
              <TextField
                placeholder="Symbol"
                value={search}
                onChange={this.onSearch}
                InputProps={{
                  startAdornment: <IconButton edge="start" disabled>
                    <SearchRounded />
                  </IconButton>
                }}
                onKeyDown={e => e.stopPropagation()}
                fullWidth
              />
            </Grid>
          </Grid>
          {this.renderSearchedPools()}
          {this.renderRecommendedPools()}
          {this.renderNewPools()}
        </Menu>
      </Grid>
      <Grid item>
        <PoolPrice address={address} />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  pool: state.pool,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getPools, getPool,
  getMints, getMint,
  getPoolData,
}, dispatch);

MintSelection.defaultProps = {
  onChange: () => { },
}

MintSelection.propTypes = {
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MintSelection)));