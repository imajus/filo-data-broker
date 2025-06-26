import alasql from 'alasql';
import lighthouse from '@lighthouse-web3/sdk';
import kavach from '@lighthouse-web3/kavach';
import { ethers } from 'ethers';
import { omit, once } from 'lodash-es';
import { getSigner } from '../signer.js';
import { NFTFactory } from '../contracts/NFTFactory.js';

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
 * @returns {Promise<Array>} - Array of data rows (header row omitted)
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
    // Get the text content
    const csvText = await response.text();
    // Parse CSV data
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) {
      return [];
    }
    // Skip header row and parse remaining rows
    const dataRows = lines.slice(1);
    const rows = dataRows.map((line) => {
      // Simple CSV parsing - split by comma and trim whitespace
      return line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''));
    });
    return rows;
  } catch (error) {
    throw new Error(`Failed to load dataset: ${error.message}`);
  }
}

/**
 * Decrypt a row of data
 * @param {any} row - The row of data to decrypt
 * @returns {Promise<any>} - The decrypted row of data
 */
export async function decryptRow(row) {
  const signer = getSigner();
  const encryptionKey = await lighthouse.fetchEncryptionKey(
    row.cid,
    signer.address,
    await signAuthMessage(signer)
  );
  const decrypted = await lighthouse.decryptFile(
    row.cid,
    encryptionKey.data.key
  );
  return { ...omit(row, 'cid'), ...decrypted };
}

/** @implements {Dataset} */
export class FilecoinDataset {
  name = null;
  description = null;
  columns = [];
  cid = null;
  rows = null;

  constructor(address) {
    this.address = address;
  }

  static async load(address) {
    const dataset = new FilecoinDataset(address);
    await dataset.#initialize();
    return dataset;
  }

  get id() {
    return this.address;
  }

  async #initialize() {
    const factory = NFTFactory.getInstance();
    const metadata = await factory.getDatasetMetadata(this.address);
    this.name = metadata.name;
    this.description = metadata.description;
    this.columns = metadata.columns;
    this.cid = metadata.cid;
    this.rows = await fetchDataset(this.cid);
  }

  async query(sql) {
    // Ensure data is loaded
    if (!this.rows) {
      await this.#initialize();
    }
    try {
      // Use AlaSQL to query the data array
      const result = alasql(sql, [this.rows]);
      // Ensure we always return an array
      return (Array.isArray(result) ? result : []).map(decryptRow);
    } catch (error) {
      throw new Error(`SQL query failed: ${error.message}`);
    }
  }
}
