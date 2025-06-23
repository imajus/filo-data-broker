import { ethers } from 'ethers';
import lighthouse from '@lighthouse-web3/sdk';
import kavach from '@lighthouse-web3/kavach';
import { once } from 'lodash-es';

/**
 * Sign the authentication message
 * @param {ethers.Wallet} signer - The signer to sign the authentication message
 * @returns {Promise<string>} - The JWT token
 */
const signAuthMessage = once(async (signer) => {
  const authMessage = await kavach.getAuthMessage(signer.address);
  const signedMessage = await signer.signMessage(authMessage.message);
  const { JWT, error } = await kavach.getJWT(signer.address, signedMessage);
  if (error) {
    throw new Error(error);
  }
  return JWT;
});

/**
 * Class for uploading data to Lighthouse
 */
export class Uploader {
  /**
   * @param {Object} options - The options object
   * @param {string} options.apiKey - The API key for the Lighthouse API
   * @param {string} options.privateKey - The private key for the Ethereum account
   */
  constructor({ apiKey, privateKey }) {
    this.apiKey = apiKey;
    this.privateKey = privateKey;
  }

  get signer() {
    return new ethers.Wallet(this.privateKey);
  }

  /**
   * Apply NFT-gated access restriction to the data
   * @param {string} cid - The CID of the data
   * @returns {Promise<boolean>} - Whether the access condition was applied successfully
   */
  async applyAccessRestriction(cid) {
    const conditions = [
      {
        id: 1,
        chain: 'Calibration',
        method: 'balanceOf',
        standardContractType: 'ERC721',
        //TODO: Replace with contract deployment
        contractAddress: process.env.NFT_CONTRACT_ADDRESS,
        returnValueTest: {
          comparator: '>=',
          value: '1',
        },
        parameters: [':userAddress'],
      },
    ];
    const aggregator = '([1])';
    const response = await lighthouse.applyAccessCondition(
      this.signer.address,
      cid,
      await signAuthMessage(this.signer),
      conditions,
      aggregator
    );
    if (response.error) {
      throw new Error(response.error);
    }
    return response.isSuccess;
  }

  /**
   * Encrypt and upload private data to Lighthouse
   * @param {Object} data - The private data object
   * @returns {Promise<string>} - The CID of the uploaded data
   */
  async uploadPrivateData(data) {
    const response = await lighthouse.textUploadEncrypted(
      JSON.stringify(data),
      this.apiKey,
      this.signer.address,
      await signAuthMessage(this.signer),
      'private'
    );
    return response.data[0].Hash;
  }

  /**
   * Upload public data to Lighthouse
   * @param {string} filePath - The path to the public data file
   * @returns {Promise<string>} - The CID of the uploaded data
   */
  async uploadPublicData(filePath) {
    const response = await lighthouse.upload(filePath, this.apiKey);
    return response.data.Hash;
  }
}
