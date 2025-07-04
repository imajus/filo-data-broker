import { Synapse } from '@filoz/synapse-sdk';

/**
 * @param {import('ethers').Signer} signer
 * @returns {Promise<import('@filoz/synapse-sdk').Synapse>}
 */
export const getSynapse = async (signer) =>
  Synapse.create({
    signer,
    withCDN: true,
    pandoraAddress: '0xAB187e95508699b36b91b727365E1B24362eFaA6',
  });
