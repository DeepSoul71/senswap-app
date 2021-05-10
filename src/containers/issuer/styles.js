// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  paper: {
    padding: theme.spacing(2),
  },
  tab: {
    minHeight: theme.spacing(7),
    minWidth: 'initial',
  },
  selectedTab: {
    fontWeight: 700,
  },
  navigation: {
    background: theme.palette.background.secondary,
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0px 0px`,
    margin: `${-theme.spacing(2)}px ${-theme.spacing(2)}px 0px ${-theme.spacing(2)}px`
  }
});