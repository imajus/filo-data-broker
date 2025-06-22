import fs from 'fs-extra';
import { parse } from 'csv-parse';

/**
 * Class for importing data from CSV files
 */
export class Importer {
  /**
   * @param {import('./processor.js').Processor} processor - The processor instance
   */
  constructor(processor) {
    this.processor = processor;
  }

  async process(filePath, { onHeaders, onTick }) {
    let rowCount = 0;
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
      stream.on('error', reject);
      stream.pipe(parser);
      parser
        .on('headers', (headers) => {
          parser.pause();
          onHeaders(headers)
            .then(() => {
              parser.resume();
            })
            .catch((err) => {
              parser.destroy();
              reject(err);
            });
          return true;
        })
        .on('data', async (record) => {
          // Process each row one by one without storing in memory
          rowCount++;
          // Show progress every 1000 rows
          if (onTick && rowCount % 1000 === 0) {
            onTick(rowCount);
          }
          // Call the row processor function with error handling
          try {
            parser.pause();
            await this.processor.process(record);
            parser.resume();
          } catch (err) {
            parser.destroy();
            reject(
              new Error(`Failed to process row ${rowCount}: ${err.message}`)
            );
          }
        })
        .on('error', reject)
        .on('end', () => resolve({ rowCount }));
    });
  }
}
