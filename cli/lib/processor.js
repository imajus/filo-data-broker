import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { pipeline } from 'stream';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { transform } from 'stream-transform';
import { pick, omit } from 'lodash-es';

/**
 * Class for transforming CSV data
 */
export class Processor {
  /**
   * @param {Object} options - The options object
   * @param {import('./uploader').Uploader} options.uploader - The Uploader instance for handling data uploads
   */
  constructor({ uploader }) {
    this.uploader = uploader;
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
    // Upload private record data and apply access restriction
    const cid = await this.uploader.uploadPrivateData(privateData);
    await this.uploader.applyAccessRestriction(cid);
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
          // Call the row processor function with error handling
          const result = await this.transform(record);
          // Show progress
          if (onTick) {
            onTick(result);
          }
          callback(null, result);
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
            // Upload public data to IPFS
            const cid = await this.uploader.uploadPublicData(outputPath);
            resolve(cid);
          }
        }
      );
    });
  }
}
