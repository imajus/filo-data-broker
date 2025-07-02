import { getSynapse } from './synapse.js';

export class SynapseStorage {
  /** @type {import('@filoz/synapse-sdk').StorageService} */
  #storage;

  constructor(storage) {
    this.#storage = storage;
  }

  /**
   * @param {import('ethers').Signer} signer
   * @returns {Promise<SynapseStorage>}
   */
  static async create(signer) {
    const synapse = await getSynapse(signer);
    const storage = await synapse.createStorage({ withCDN: true });
    return new SynapseStorage(storage);
  }

  /**
   * Check if upload is possible
   * @param {number} size
   */
  async preflight(size) {
    const preflight = await this.#storage.preflightUpload(size);
    if (!preflight.allowanceCheck.sufficient) {
      throw new Error(
        preflight.allowanceCheck.message ??
          'Insufficient allowance to upload data'
      );
    }
    return preflight;
  }

  /**
   * Upload data
   * @param {string} data
   * @returns {Promise<import('@filoz/synapse-sdk').CommP>}
   */
  async upload(data) {
    const encoded = new TextEncoder().encode(data);
    const result = await this.#storage.upload(encoded);
    return result.commp;
  }
}
