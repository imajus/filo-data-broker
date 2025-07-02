import { ethers } from 'ethers';
import { NFT } from './contracts/NFT.js';
import { SynapseStorage } from './synapse/storage.js';

/**
 * Class for uploading data to Lighthouse
 */
export class Uploader {
  /** @type {ethers.Wallet} */
  #wallet;
  /** @type {import('./synapse/storage').SynapseStorage} */
  #storage;

  /**
   * @param {ethers.Wallet} wallet - The wallet for the Ethereum account
   */
  constructor(wallet) {
    this.#wallet = wallet;
    this.nft = new NFT(null, wallet);
  }

  async getStorage() {
    if (!this.#storage) {
      this.#storage = await SynapseStorage.create(this.#wallet);
    }
    return this.#storage;
  }

  /**
   * Encrypt and upload private data to Filecoin
   * @param {string} data - The private data
   * @returns {Promise<import('@filoz/synapse-sdk').CommP>} - The CommP of the uploaded data
   */
  async uploadPrivateData(data) {
    //TODO: Encrypt data
    return this.uploadPublicData(data);
  }

  /**
   * Upload public data to Filecoin
   * @param {string} data - The public data
   * @returns {Promise<import('@filoz/synapse-sdk').CommP>} - The CommP of the uploaded data
   */
  async uploadPublicData(data) {
    const storage = await this.getStorage();
    await storage.preflight(Buffer.byteLength(data));
    const commp = await storage.upload(data);
    return commp;
  }
}
