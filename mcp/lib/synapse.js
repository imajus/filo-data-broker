import { Synapse } from '@filoz/synapse-sdk';
import { parse } from 'csv-parse';
import { getProvider } from './signer.js';
import { decryptNFTGatedData } from './lit.js';
import { ethers } from 'ethers';

export class SynapseStorage {
  #storage;

  constructor(storage) {
    this.#storage = storage;
  }

  /**
   * Create a new SynapseStorage instance
   * @param {string} owner - The address of the collection owner
   * @returns {Promise<SynapseStorage>} - The SynapseStorage instance
   */
  static async create(owner) {
    const synapse = await Synapse.create({
      signer: new ethers.VoidSigner(owner, getProvider()),
      withCDN: true,
      pandoraAddress: '0x55577C413A68CF7Ed1383db3b5122425787162D2',
    });
    const storage = await synapse.createStorage({ withCDN: true });
    return new SynapseStorage(storage);
  }

  parseCSV(data) {
    return new Promise((resolve, reject) => {
      parse(
        Buffer.from(data),
        {
          columns: true,
          skip_empty_lines: false,
          trim: true,
        },
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });
  }

  /**
   * Load a public dataset from Filecoin into memory
   * @param {string} cid - The CID of the public dataset
   * @returns {Promise<Array>} - Array of data objects with proper field names
   */
  async fetchPublicDataset(cid) {
    const data = await this.#storage.providerDownload(cid);
    return this.parseCSV(data);
  }

  /**
   * Load a private dataset from Filecoin into memory
   * @param {string} address - The address of the NFT collection
   * @param {string} cid - The CID of private dataset
   * @param {string} dataHash - The hash of the data to fetch
   * @returns {Promise<Array>} - The decrypted data
   */
  async fetchPrivateDataset(address, cid, dataHash) {
    const data = await this.#storage.providerDownload(cid);
    const decrypted = await decryptNFTGatedData(
      address,
      new TextDecoder().decode(data),
      dataHash
    );
    return this.parseCSV(decrypted);
  }
}
