import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { pipeline, compose } from 'stream';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { transform } from 'stream-transform';

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
  }

  async headers(inputPath) {
    return new Promise((resolve, reject) => {
      const parser = parse({
        columns: (headers) => {
          parser.destroy();
          resolve(headers);
        },
        skip_empty_lines: true,
        trim: true,
      });
      parser.on('error', reject);
      fs.createReadStream(inputPath).pipe(parser);
    });
  }

  async process(inputPath, { publicColumns, privateColumns, onTick }) {
    const publicOutputPath = makeOutputFilePath('public');
    const privateOutputPath = makeOutputFilePath('private');
    const parser = parse({
      skip_empty_lines: true,
      columns: true,
      trim: true,
    });
    const inputStream = compose(
      fs.createReadStream(inputPath),
      parser,
      transform((record, callback) => {
        try {
          onTick?.(record);
          callback(null, record);
        } catch (err) {
          callback(err);
        }
      })
    );
    // Split CSV into public and private data
    const [publicCid, privateCid] = await Promise.all([
      transformData(inputStream, publicColumns, publicOutputPath).then(() =>
        this.uploader.uploadPublicData(publicOutputPath)
      ),
      transformData(inputStream, privateColumns, privateOutputPath).then(() =>
        this.uploader.uploadPrivateData(privateOutputPath)
      ),
    ]);
    await this.uploader.applyAccessRestriction(privateCid);
    return { publicCid, privateCid };
  }
}

/**
 * Make a temporary output file path
 * @param {string} suffix - The suffix to add to the output file name
 * @returns {string} - The path to the temporary output file
 */
function makeOutputFilePath(suffix) {
  const tmpDir = os.tmpdir();
  const uniqueId = Date.now();
  return path.join(tmpDir, `output-${uniqueId}-${suffix}.csv`);
}

/**
 * Transform data from input stream to output file
 * @param {import('stream').Readable} inputStream - The input stream
 * @param {string[]} columns - The columns to include in the output
 * @param {string} outputPath - The path to the output file
 * @returns {Promise<void>} - A promise that resolves when the data is transformed
 */
function transformData(inputStream, columns, outputPath) {
  return new Promise((resolve, reject) => {
    pipeline(
      inputStream,
      stringify({
        quoted: true,
        header: true,
        columns,
      }),
      fs.createWriteStream(outputPath),
      (err) => (err ? reject(err) : resolve())
    );
  });
}
