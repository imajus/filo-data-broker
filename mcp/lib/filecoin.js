import { ethers } from 'ethers';

export const Network = {
  id: 314159,
  rpc: 'https://api.calibration.node.glif.io/rpc/v1',
  name: 'Filecoin Calibration',
};

export function getProvider() {
  const provider = new ethers.JsonRpcProvider(Network.rpc, {
    name: Network.name,
    chainId: Network.id,
  });
  return provider;
}
