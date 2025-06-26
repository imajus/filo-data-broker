import { NFTFactory } from '../../lib/contracts/NFTFactory.js';
import { FilecoinDataset } from './FilecoinDataset.js';

/** @implements {DatasetFactory} */
export class FilecoinDatasetFactory {
  constructor() {
    this.factory = NFTFactory.getInstance();
  }

  async get(address) {
    return new FilecoinDataset(address);
  }

  async list() {
    const datasets = await this.factory.listDatasets();
    return datasets.map((ds) => ({
      id: ds.address,
      name: ds.name,
      description: ds.description,
      columns: ds.columns,
    }));
  }
}
