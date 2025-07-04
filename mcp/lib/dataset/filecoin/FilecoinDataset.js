import alasql from 'alasql';
import { FDBRegistry } from '../../contracts/FDBRegistry.js';
import { transformQuery } from '../../sql.js';
import { fetchPrivateDataset, fetchPublicDataset } from '../../synapse.js';
import { ethers } from 'ethers';

alasql.options.cache = true;

/** @implements {Dataset} */
export class FilecoinDataset {
  /** @type {string} */
  #address = null;
  /** @type {string} */
  #owner = null;
  /** @type {string} */
  #publicCid = null;
  /** @type {string} */
  #privateCid = null;
  /** @type {BigInt} */
  #price = null;
  /** @type {Array} */
  #rows = null;
  /** @type {boolean} */
  #decrypted = false;
  /** @type {boolean} */
  #purchased = false;

  constructor(address) {
    this.#address = address;
  }

  static async load(address) {
    const dataset = new FilecoinDataset(address);
    await dataset.#initialize();
    return dataset;
  }

  get id() {
    return this.#address;
  }

  get price() {
    return ethers.formatUnits(this.#price.toString(), 18);
  }

  async #initialize() {
    const factory = FDBRegistry.getInstance();
    const metadata = await factory.getDatasetMetadata(this.#address);
    this.name = metadata.name;
    this.description = metadata.description;
    this.publicColumns = metadata.publicColumns;
    this.privateColumns = metadata.privateColumns;
    this.#price = metadata.price;
    this.#owner = metadata.owner;
    this.#publicCid = metadata.publicCid;
    this.#privateCid = metadata.privateCid;
    this.#rows = await fetchPublicDataset(this.#owner, this.#publicCid);
  }

  async #decrypt() {
    if (!this.#decrypted) {
      const rows = await fetchPrivateDataset(this.#owner, this.#privateCid);
      this.#rows = this.#rows.map((row, i) => ({ ...row, ...rows[i] }));
      this.#decrypted = true;
    }
  }

  async purchase() {
    if (!this.#purchased) {
      const factory = FDBRegistry.getInstance();
      await factory.purchase(this.#address, this.#price);
      this.#purchased = true;
    }
  }

  async query(sql) {
    // Ensure data is loaded
    if (!this.#rows) {
      await this.#initialize();
    }
    // Ensure dataset is purchased
    if (!this.#purchased) {
      await this.purchase();
    }
    // Ensure data is decrypted
    if (!this.#decrypted) {
      await this.#decrypt();
    }
    // Use AlaSQL to query the data array
    const result = alasql(transformQuery(sql), [this.#rows]);
    // Ensure we always return an array
    return Array.isArray(result) ? result : [];
  }
}
