import { ethers } from 'ethers';

const RPC_URL = `https://api.calibration.node.glif.io/rpc/v1`;

export function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

export function getSigner() {
  const provider = getProvider();
  return new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);
}
