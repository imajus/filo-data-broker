import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import alasql from 'alasql';
import { transformQuery } from '../../sql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const obj = {};
    headers.forEach((header, index) => {
      let value = values[index];
      // Try to parse numbers
      if (!isNaN(value) && value !== '') {
        value = parseFloat(value);
      }
      obj[header] = value;
    });
    return obj;
  });
  return { headers, rows };
}

function loadDataset(fileName) {
  const csvPath = join(LocalDataset.BASE_DIR, fileName);
  const csvContent = readFileSync(csvPath, 'utf-8');
  return parseCSV(csvContent);
}

/** @implements {Dataset} */
export class LocalDataset {
  #rows = null;

  static BASE_DIR = join(__dirname, '../../..', 'sample');

  constructor(fileName) {
    // Extract name from address (assuming address is the dataset name for now)
    this.id = this.name = fileName.replace('.csv', '');
    // Set descriptions based on known datasets
    const descriptions = {
      'customer-transactions':
        'Customer transaction data for e-commerce analysis',
      'user-behavior': 'User behavior tracking data',
      'financial-reports': 'Monthly financial reports and metrics',
      'inventory-data': 'Product inventory levels and stock movements',
      'marketing-campaigns': 'Marketing campaign performance metrics',
    };
    this.description = descriptions[this.id] || fileName;
  }

  static async load(fileName) {
    const dataset = new LocalDataset(fileName);
    await dataset.#initialize();
    return dataset;
  }

  async #initialize() {
    // Load data to get columns
    const { headers, rows } = await loadDataset(`${this.id}.csv`);
    this.publicColumns = headers;
    this.privateColumns = [];
    this.#rows = rows ?? [];
  }

  async query(sql) {
    // Ensure data is loaded
    if (!this.#rows) {
      await this.#initialize();
    }
    try {
      // Use AlaSQL to query the in-memory data
      const result = alasql(transformQuery(sql), [this.#rows]);
      // Ensure we always return an array
      return Array.isArray(result) ? result : [];
    } catch (error) {
      throw new Error(`SQL query failed: ${error.message}`);
    }
  }
}
