import alasql from 'alasql';
import lighthouse from '@lighthouse-web3/sdk';
import kavach from '@lighthouse-web3/kavach';
import { ethers } from 'ethers';
import { omit, once } from 'lodash-es';
import { parse } from 'csv-parse';
import { transform } from 'stream-transform';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { getSigner } from '../../signer.js';
import { NFTFactory } from '../../contracts/NFTFactory.js';
import { transformQuery } from '../../sql.js';

alasql.options.cache = true;

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
 * Load a dataset from Filecoin into memory
 * @param {string} cid - The CID of the dataset
 * @returns {Promise<Array>} - Array of data objects with proper field names
 */
export async function fetchDataset(cid) {
  try {
    // Construct the IPFS gateway URL
    const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;
    // Make the HTTP GET request
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    // Convert Web ReadableStream to Node.js Readable
    const input = Readable.fromWeb(response.body);
    // Create CSV parser
    const parser = parse({
      columns: true, // Use first row as column headers
      skip_empty_lines: true,
      trim: true,
    });
    // Collect records using stream-transform
    const records = [];
    const collector = transform((record, callback) => {
      records.push(record);
      callback();
    });
    // Use pipeline to connect streams
    await pipeline(input, parser, collector);
    return records;
  } catch (err) {
    throw new Error(`Failed to load dataset: ${err.message}`);
  }
}

/**
 * Decrypt a row of data
 * @param {any} row - The row of data to decrypt
 * @returns {Promise<any>} - The decrypted row of data
 */
export async function decryptRow(row) {
  const signer = getSigner();
  const encryptionKey = await lighthouse
    .fetchEncryptionKey(row.cid, signer.address, await signAuthMessage(signer))
    .catch((err) => {
      throw new Error(`Encryption key fetch failed: ${err.message.message}`);
    });
  const decryptedBuffer = await lighthouse.decryptFile(
    row.cid,
    encryptionKey.data.key,
    'text/csv'
  );
  const decryptedText = new TextDecoder().decode(decryptedBuffer);
  const decrypted = JSON.parse(decryptedText);
  return { ...omit(row, 'cid'), ...decrypted };
}

/** @implements {Dataset} */
export class FilecoinDataset {
  #address = null;
  #rows = null;

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
    this.#rows = await fetchDataset(metadata.cid);
  }

  async query(sql) {
    // Ensure data is loaded
    if (!this.#rows) {
      await this.#initialize();
    }
    // Use AlaSQL to query the data array
    const result = alasql(transformQuery(sql), [this.#rows]);
    // Ensure we always return an array
    return await Promise.all(
      // Decrypt each row in result
      (Array.isArray(result) ? result : []).map(decryptRow)
    );
  }
}
