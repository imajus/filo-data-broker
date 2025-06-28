import { FilecoinDatasetFactory } from './filecoin/FilecoinDatasetFactory.js';
// import { LocalDatasetFactory } from './mock/LocalDatasetFactory.js';

let instance = null;

/**
 * Get the dataset factory instance
 * @returns {DatasetFactory} - The dataset factory instance
 */
export function getDatasetFactory() {
  if (!instance) {
    instance = new FilecoinDatasetFactory();
  }
  return instance;
}
