import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';

import styles from './styles';


class LPTAvatar extends Component {

  render() {
    const { classes } = this.props;
    const { address, title, marginRight, onClick } = this.props;

    return <Tooltip title={title}>
      <Avatar className={classes.lptIcon} onClick={onClick} style={{ marginRight: marginRight ? 8 : 0 }}>
        <Typography variant="h5">{ssjs.randEmoji(address)}</Typography>
      </Avatar>
    </Tooltip>
  }
}

LPTAvatar.defaultProps = {
  address: '',
  title: '',
  marginRight: false,
  onClick: () => { },
}

LPTAvatar.propTypes = {
  address: PropTypes.string,
  title: PropTypes.string,
  marginRight: PropTypes.bool,
  onClick: PropTypes.func,
}

export default withStyles(styles)(LPTAvatar);