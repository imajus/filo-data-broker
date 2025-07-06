import { ethers } from 'ethers';
import { SynapseStorage } from './synapse/storage.js';
import { encryptDataWithNFTGatedAccess } from './lit.js';

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
  }

  async getStorage() {
    if (!this.#storage) {
      this.#storage = await SynapseStorage.create(this.#wallet);
    }
    return this.#storage;
  }

  /**
   * Encrypt and upload private data to Filecoin
   * @param {string} address - The address of the NFT contract
   * @param {string} data - The private data
   * @returns {Promise<{cid: import('@filoz/synapse-sdk').CommP, hash: string}>} - The CID and hash of the uploaded data
   */
  async uploadPrivateData(address, data) {
    const { ciphertext, dataToEncryptHash } =
      await encryptDataWithNFTGatedAccess(address, data);
    const cid = await this.uploadPublicData(ciphertext);
    return { cid, hash: dataToEncryptHash };
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
