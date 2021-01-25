/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  node: 'https://devnet.solana.com',
  tokenFactoryAddress: 'JCbHuGZyQiC9abPpEHfs6W8evgumEYthpqqBsgDRewa8',
  swapFactoryAddress: '23Y2WwZY149zE7tcXrQA46Zfj3zvkkibHn3xCZ4qJBgi',
  explorer: (txId) => {
    return `https://explorer.solana.com/tx/${txId}?cluster=devnet`
  }
}

/**
 * Staging configurations
 */
configs.staging = {
  node: 'https://devnet.solana.com',
  tokenFactoryAddress: 'JCbHuGZyQiC9abPpEHfs6W8evgumEYthpqqBsgDRewa8',
  swapFactoryAddress: '23Y2WwZY149zE7tcXrQA46Zfj3zvkkibHn3xCZ4qJBgi',
  explorer: (txId) => {
    return `https://explorer.solana.com/tx/${txId}?cluster=devnet`
  }
}

/**
 * Production configurations
 */
configs.production = {
  node: '',
  tokenFactoryAddress: '',
  swapFactoryAddress: '',
  explorer: (txId) => {
    return `https://explorer.solana.com/tx/${txId}`
  }
}

/**
 * Module exports
 */
export default configs;