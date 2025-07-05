import { Synapse } from '@filoz/synapse-sdk';

/**
 * @param {import('ethers').Signer} signer
 * @returns {Promise<import('@filoz/synapse-sdk').Synapse>}
 */
export const getSynapse = async (signer) =>
  Synapse.create({
    signer,
    withCDN: true,
    pandoraAddress: '0x7cc566A5402713f4E09C0669E113Ef21Fd8a2c32',
  });
