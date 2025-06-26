import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

function loadDataset(datasetName) {
  const csvPath = join(LocalDataset.BASE_DIR, `${datasetName}.csv`);
  const csvContent = readFileSync(csvPath, 'utf-8');
  return parseCSV(csvContent);
}

/** @implements {Dataset} */
export class LocalDataset {
  rows = null;

  static BASE_DIR = join(__dirname, '../../..', 'sample');

  constructor(filename) {
    this.filename = filename;
  }

  static async create(filename) {
    const dataset = new LocalDataset(filename);
    await dataset.#initialize();
    return dataset;
  }

  async #initialize() {
    // Extract name from address (assuming address is the dataset name for now)
    this.id = this.name = this.filename.replace('.csv', '');
    // Set descriptions based on known datasets
    const descriptions = {
      'customer-transactions':
        'Customer transaction data for e-commerce analysis',
      'user-behavior': 'User behavior tracking data',
      'financial-reports': 'Monthly financial reports and metrics',
      'inventory-data': 'Product inventory levels and stock movements',
      'marketing-campaigns': 'Marketing campaign performance metrics',
    };
    this.description = descriptions[this.name] || this.filename;
    // Load data to get columns
    const { headers, rows } = await loadDataset(this.id);
    this.columns = headers;
    this.rows = rows ?? [];
  }

  async search(query) {
    // Ensure data is loaded
    if (!this.rows) {
      await this.#initialize();
    }
    // Simple search implementation - search across all string fields
    const searchTerm = query.toLowerCase();
    return this.rows.filter((row) => {
      return Object.values(row).some((value) => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm);
        }
        if (typeof value === 'number') {
          return value.toString().includes(searchTerm);
        }
        return false;
      });
    });
  }

  async fetch() {
    // Ensure data is loaded
    if (!this.rows) {
      await this.#initialize();
    }
    return this.rows || [];
  }
}
