import { Synapse } from '@filoz/synapse-sdk';

/**
 * @param {import('ethers').Signer} signer
 * @returns {Promise<import('@filoz/synapse-sdk').Synapse>}
 */
export const getSynapse = async (signer) =>
  Synapse.create({
    signer,
    withCDN: true,
    pandoraAddress: '0x55577C413A68CF7Ed1383db3b5122425787162D2',
  });
