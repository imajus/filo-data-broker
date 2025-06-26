import { readdirSync } from 'fs';
import { LocalDataset } from './LocalDataset.js';
import { pick } from 'lodash-es';

/** @implements {DatasetFactory} */
export class LocalDatasetFactory {
  async get(id) {
    return LocalDataset.load(`${id}.csv`);
  }

  async list() {
    // Get all CSV files from the sample directory
    const csvFiles = readdirSync(LocalDataset.BASE_DIR).filter((file) =>
      file.endsWith('.csv')
    );
    // Create Dataset instances for each CSV file
    const datasets = await Promise.all(
      csvFiles.map((file) => LocalDataset.load(file))
    );
    return datasets.map((ds) =>
      pick(ds, ['id', 'name', 'description', 'columns'])
    );
  }

  async search(query) {
    // Get all datasets
    const allDatasets = await this.list();
    // Search for datasets that match the query in name, description, or columns
    const searchTerm = query.trim().toLowerCase();
    return allDatasets
      .filter(({ name, description, columns }) =>
        [name, description, ...columns].some((field) =>
          field.toLowerCase().includes(searchTerm)
        )
      )
      .map((ds) => pick(ds, ['id', 'name', 'description', 'columns']));
  }
}
