import alasql from 'alasql';
import { NFTFactory } from '../../contracts/NFTFactory.js';
import { transformQuery } from '../../sql.js';
import { fetchPrivateDataset, fetchPublicDataset } from '../../lighthouse.js';

alasql.options.cache = true;

/** @implements {Dataset} */
export class FilecoinDataset {
  #address = null;
  #publicCid = null;
  #privateCid = null;
  #rows = null;
  #decrypted = false;

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

  async #initialize() {
    const factory = NFTFactory.getInstance();
    const metadata = await factory.getDatasetMetadata(this.#address);
    this.name = metadata.name;
    this.description = metadata.description;
    this.publicColumns = metadata.publicColumns;
    this.privateColumns = metadata.privateColumns;
    this.price = metadata.price;
    this.#publicCid = metadata.publicCid;
    this.#privateCid = metadata.privateCid;
    this.#rows = await fetchPublicDataset(this.#publicCid);
  }

  async #decrypt(signerAddress, signedMessage) {
    if (!this.#decrypted) {
      const rows = await fetchPrivateDataset(
        this.#privateCid,
        signerAddress,
        signedMessage
      );
      this.#rows = this.#rows.map((row, i) => ({ ...row, ...rows[i] }));
      this.#decrypted = true;
    }
  }

  async query(sql, signerAddress, signedMessage) {
    // Ensure data is loaded
    if (!this.#rows) {
      await this.#initialize();
    }
    // Ensure data is decrypted
    if (!this.#decrypted) {
      await this.#decrypt(signerAddress, signedMessage);
    }
    // Use AlaSQL to query the data array
    const result = alasql(transformQuery(sql), [this.#rows]);
    // Ensure we always return an array
    return Array.isArray(result) ? result : [];
  }
}
