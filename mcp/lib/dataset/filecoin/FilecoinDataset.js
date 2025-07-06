import alasql from 'alasql';
import { FDBRegistry } from '../../contracts/FDBRegistry.js';
import { transformQuery } from '../../sql.js';
import { SynapseStorage } from '../../synapse.js';
import { ethers } from 'ethers';

alasql.options.cache = true;

/** @implements {Dataset} */
export class FilecoinDataset {
  /** @type {string} */
  #address = null;
  /** @type {string} */
  #owner = null;
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
    const registry = FDBRegistry.getInstance();
    const metadata = await registry.getCollectionInfo(this.#address);
    this.name = metadata.name;
    this.description = metadata.description;
    this.publicColumns = metadata.publicColumns;
    this.privateColumns = metadata.privateColumns;
    this.#price = metadata.price;
    this.#owner = metadata.owner;
  }

  async #download() {
    if (!this.#rows) {
      const registry = FDBRegistry.getInstance();
      const storage = await SynapseStorage.create(this.#owner);
      const { publicCid, privateCid, privateDataHash } =
        await registry.getDatasetInfo(this.#address);
      this.#rows = await storage.fetchPublicDataset(publicCid);
      if (!this.#decrypted) {
        const rows = await storage.fetchPrivateDataset(
          this.#address,
          privateCid,
          privateDataHash
        );
        this.#rows = this.#rows.map((row, i) => ({ ...row, ...rows[i] }));
        this.#decrypted = true;
      }
    }
  }

  async purchase() {
    if (!this.#purchased) {
      const registry = FDBRegistry.getInstance();
      await registry.purchase(this.#address, this.#price);
      this.#purchased = true;
    }
  }

  async query(sql) {
    await this.#download();
    const result = alasql(transformQuery(sql), [this.#rows]);
    return Array.isArray(result) ? result : [];
  }
}
