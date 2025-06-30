import { ethers } from 'ethers';
import lighthouse from '@lighthouse-web3/sdk';
import kavach from '@lighthouse-web3/kavach';
import Bottleneck from 'bottleneck';
import { NFT } from './contracts/NFT.js';

/**
 * Sign the authentication message
 * @param {ethers.Wallet} signer - The signer to sign the authentication message
 * @returns {Promise<string>} - The JWT token
 */
const signAuthMessage = async (signer) => {
  const authMessage = await kavach.getAuthMessage(signer.address);
  const signedMessage = await signer.signMessage(authMessage.message);
  return signedMessage;
};

/**
 * Class for uploading data to Lighthouse
 */
export class Uploader {
  /**
   * @param {string} apiKey - The API key for the Lighthouse API
   * @param {string} privateKey - The private key for the Ethereum account
   */
  constructor(apiKey, privateKey) {
    this.apiKey = apiKey;
    this.privateKey = privateKey;
    this.nft = new NFT(null, privateKey);
    this.limiter = new Bottleneck({
      maxConcurrent: 10,
      minTime: 1000 / 60,
    });
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
        chain: 'Filecoin_Testnet',
        method: 'balanceOf',
        standardContractType: 'ERC721',
        contractAddress: this.nft.address,
        returnValueTest: {
          comparator: '>=',
          value: '1',
        },
        parameters: [':userAddress'],
      },
    ];
    const aggregator = '([1])';
    const signedMessage = await signAuthMessage(this.signer);
    const { isSuccess, error } = await kavach.accessControl(
      this.signer.address,
      cid,
      signedMessage,
      conditions,
      aggregator
    );
    if (error) {
      throw new Error(`Access restriction failed: ${error}`);
    }
    if (!isSuccess) {
      throw new Error('Access restriction failed: Unknown error');
    }
  }

  /**
   * Encrypt and upload private data to Lighthouse
   * @param {string} filePath - The path to the private data file
   * @returns {Promise<string>} - The CID of the uploaded data
   */
  async uploadPrivateData(filePath) {
    const response = await this.limiter.schedule(async () => {
      const signedMessage = await signAuthMessage(this.signer);
      return lighthouse.uploadEncrypted(
        filePath,
        this.apiKey,
        this.signer.address,
        signedMessage
      );
    });
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
