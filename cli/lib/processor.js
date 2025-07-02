import fs from 'fs-extra';
import { compose } from 'stream';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { transform } from 'stream-transform';
import getStream from 'get-stream';

/**
 * Class for transforming CSV data
 */
export class Processor {
  /**
   * @param {import('./uploader').Uploader} uploader
   */
  constructor(uploader) {
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
    const [publicData, privateData] = await Promise.all([
      transformData(inputStream, publicColumns),
      transformData(inputStream, privateColumns),
    ]);
    return { publicData, privateData };
  }
}

/**
 * Transform data from input stream to output array
 * @param {import('stream').Readable} inputStream - The input stream
 * @param {string[]} columns - The columns to include in the output
 * @returns {Promise<string>} - A promise that resolves with the transformed data array
 */
async function transformData(inputStream, columns) {
  const csvStream = compose(
    inputStream,
    stringify({
      quoted: true,
      header: true,
      columns,
    })
  );
  const csvString = await getStream(csvStream);
  return csvString;
}
