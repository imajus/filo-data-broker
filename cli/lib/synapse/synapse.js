import { Synapse } from '@filoz/synapse-sdk';

/**
 * @param {import('ethers').Signer} signer
 * @returns {Promise<import('@filoz/synapse-sdk').Synapse>}
 */
export const getSynapse = async (signer) =>
  Synapse.create({
    signer,
    withCDN: true,
    pandoraAddress: '0x485da5B22E524F292108F485E5c56a6db6572547',
  });
