import { ethers } from 'ethers';

const RPC_URL = `https://api.calibration.node.glif.io/rpc/v1`;

export function getSigner() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);
}
