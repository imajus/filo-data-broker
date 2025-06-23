import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { pipeline } from 'stream';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { transform } from 'stream-transform';
import { ethers } from 'ethers';
import lighthouse from '@lighthouse-web3/sdk';
import kavach from '@lighthouse-web3/kavach';
import { pick, omit, once } from 'lodash-es';

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
 * Class for transforming CSV data
 */
export class Processor {
  /**
   * @param {Object} options - The options object
   * @param {string} options.apiKey - The API key for the Lighthouse API
   * @param {string} options.privateKey - The private key for the Ethereum account
   */
  constructor({ apiKey, privateKey }) {
    this.apiKey = apiKey;
    this.privateKey = privateKey;
    this.publicColumns = [];
    this.privateColumns = [];
  }

  /**
   * Set which columns contain private data
   * @param {Array} publicColumns - Array of column names that contain public data
   * @param {Array} privateColumns - Array of column names that contain private data
   */
  setColumns(publicColumns, privateColumns) {
    this.publicColumns = publicColumns;
    this.privateColumns = privateColumns;
  }

  /**
   * Encrypt and upload private data to Lighthouse
   * @param {Object} data - The private data object
   * @returns {Promise<string>} - The CID of the uploaded data
   */
  async uploadPrivateData(data) {
    const signer = new ethers.Wallet(this.privateKey);
    const response = await lighthouse.textUploadEncrypted(
      JSON.stringify(data),
      this.apiKey,
      signer.address,
      await signAuthMessage(signer),
      'private'
    );
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

  /**
   * Make a temporary output file path
   * @returns {string} - The path to the temporary output file
   */
  makeOutputFilePath() {
    const tmpDir = os.tmpdir();
    const uniqueId = Date.now();
    return path.join(tmpDir, `output-${uniqueId}.csv`);
  }

  /**
   * Process a single CSV record
   * @param {Object} record - The row data object with column names as keys
   */
  async transform(record) {
    // Extract private and public data using lodash utilities
    const privateData = pick(record, this.privateColumns);
    const publicData = omit(record, this.privateColumns);
    // Upload record to the database
    const cid = await this.uploadPrivateData(privateData);
    return { ...publicData, cid };
  }

  async process(inputPath, { onHeaders, onTick }) {
    return new Promise((resolve, reject) => {
      const outputPath = this.makeOutputFilePath();
      const parser = parse({
        columns: (headers) => {
          // Call onHeaders callback when headers are detected
          if (onHeaders) {
            parser.pause();
            onHeaders(headers)
              .then(() => {
                parser.resume();
              })
              .catch((err) => {
                parser.destroy();
                reject(err);
              });
          }
          return headers; // Return headers to be used as column names
        },
        skip_empty_lines: true,
        trim: true,
      });
      const transformer = transform(async (record, callback) => {
        try {
          const result = await this.transform(record);
          // Show progress every 1000 rows
          if (onTick) {
            onTick(result);
          }
          // Call the row processor function with error handling
          callback(null);
        } catch (err) {
          callback(err);
        }
      });
      const stringifier = stringify({
        header: true,
        quoted: true,
      });
      pipeline(
        fs.createReadStream(inputPath),
        parser,
        transformer,
        stringifier,
        fs.createWriteStream(outputPath),
        async (err) => {
          if (err) {
            reject(err);
          } else {
            const cid = await this.uploadPublicData(outputPath);
            resolve(cid);
          }
        }
      );
    });
  }
}
