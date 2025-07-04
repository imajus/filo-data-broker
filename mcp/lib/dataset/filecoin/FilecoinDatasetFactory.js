import { ethers } from 'ethers';
import { FDBRegistry } from '../../contracts/FDBRegistry.js';
import { FilecoinDataset } from './FilecoinDataset.js';

/** @implements {DatasetFactory} */
export class FilecoinDatasetFactory {
  async get(address) {
    return new FilecoinDataset(address);
  }

  async list() {
    const datasets = await FDBRegistry.getInstance().listDatasets();
    return datasets.map((ds) => ({
      id: ds.address,
      name: ds.name,
      description: ds.description,
      publicColumns: ds.publicColumns,
      privateColumns: ds.privateColumns,
      price: ethers.formatUnits(ds.price, 18),
    }));
  }
}
