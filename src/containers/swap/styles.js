// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  paper: {
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(4),
    height: `calc(100% - ${theme.spacing(8)}px)`
  },
  imageRow: {
    padding: theme.spacing(2),
    minHeight: theme.spacing(20),
    borderRadius: `${theme.shape.borderRadius * 2}px 0px 0px ${theme.shape.borderRadius * 2}px`,
    backgroundColor: theme.palette.primary.main,
    width: `calc(100% - ${theme.spacing(2)}px)`,
    height: `calc(100% + ${theme.spacing(4)}px)`,
    marginTop: -theme.spacing(4),
    marginLeft: -theme.spacing(4),
    marginBottom: -theme.spacing(4),
  },
  imageColumn: {
    padding: theme.spacing(2),
    minHeight: theme.spacing(20),
    borderRadius: `${theme.shape.borderRadius * 2}px ${theme.shape.borderRadius * 2}px 0px 0px`,
    backgroundColor: theme.palette.primary.main,
    width: `calc(100% + ${theme.spacing(4)}px)`,
    marginTop: -theme.spacing(4),
    marginLeft: -theme.spacing(4),
  },
});