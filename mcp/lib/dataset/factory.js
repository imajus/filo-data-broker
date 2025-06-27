import { FilecoinDatasetFactory } from './filecoin/FilecoinDatasetFactory.js';
// import { LocalDatasetFactory } from './mock/LocalDatasetFactory.js';

let instance = null;

export function getDatasetFactory() {
  if (!instance) {
    instance = new FilecoinDatasetFactory();
  }
  return instance;
}
