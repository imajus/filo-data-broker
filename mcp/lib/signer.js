import { ethers } from 'ethers';

const RPC_URL = 'https://api.calibration.node.glif.io/rpc/v1';

export function getProvider() {
  return ethers.getDefaultProvider(RPC_URL);
}

export function getWallet() {
  const provider = getProvider();
  return new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);
}
